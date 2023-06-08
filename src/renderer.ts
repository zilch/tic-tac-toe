import type { RenderParams, RenderState } from "zilch-game-engine";
import type { Config, State } from "./config";
import {
  DynamicTexture,
  Engine,
  InstancedMesh,
  Mesh,
  MeshBuilder,
  PBRMaterial,
  Scene,
  SceneLoader,
  ScenePerformancePriority,
  ShadowGenerator,
  SpotLight,
  Vector3,
  BackEase,
  CubicEase,
} from "@babylonjs/core";
import "@babylonjs/loaders";
import { runAnimation, toBabylonColor } from "./ui/utils";
import { Camera } from "./ui/Camera";
import { SymbolMaterial } from "./ui/SymbolMaterial";
import { Ground } from "./ui/Ground";
import { getOutcomeAndWinningLine } from "./play";

Zilch.Renderer = class Renderer {
  engine: Engine;
  scene: Scene | null = null;
  xMaterial: SymbolMaterial | null = null;
  oMaterial: SymbolMaterial | null = null;
  initializeOperation: Promise<void>;
  camera: Camera | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.engine = new Engine(canvas);
    this.engine.loadingScreen.loadingUIBackgroundColor = "#2F343C";
    this.initializeOperation = this.initialize();
  }

  async render({ current, previous }: RenderParams<State, Config>) {
    await this.initializeOperation;

    if (
      current.dimensions.height !== previous?.dimensions.height ||
      current.dimensions.width !== previous.dimensions.width
    ) {
      this.engine.resize();
    }

    this.camera?.setStatus(current.status);

    if (current.botColors[0] !== previous?.botColors[0] && this.xMaterial) {
      this.xMaterial.updateColor(current.botColors[0]);
    }

    if (current.botColors[1] !== previous?.botColors[1] && this.oMaterial) {
      this.oMaterial.updateColor(current.botColors[1]);
    }

    const currentBoard = this.getEffectiveBoard(current);
    const previousBoard = this.getEffectiveBoard(previous);

    const currentWinningLine = this.getWinningLine(currentBoard);
    const previousWinningLine = this.getWinningLine(previousBoard);

    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        const currentSpotEmphasis =
          current.status === "done"
            ? currentWinningLine.getSpotEmphasis(x, y)
            : 0;
        const previousSpotEmphasis =
          previous?.status === "done"
            ? previousWinningLine.getSpotEmphasis(x, y)
            : 0;
        if (
          currentBoard[x][y] !== previousBoard[x][y] ||
          currentSpotEmphasis !== previousSpotEmphasis
        ) {
          this.updateBlock(x, y, currentBoard[x][y], currentSpotEmphasis);
        }
      }
    }
  }

  getWinningLine(board: ("empty" | "x" | "o")[][]) {
    const winningLine = (
      getOutcomeAndWinningLine({ board })?.winningLine ?? []
    ).map((move) => `${move.x},${move.y}`);
    return {
      getSpotEmphasis(x: number, y: number) {
        return winningLine.findIndex((value) => `${x},${y}` === value) + 1;
      },
    };
  }

  updateBlock(
    x: number,
    y: number,
    value: "x" | "o" | "empty",
    emphasisValue: number
  ) {
    const block = this.scene?.getMeshByName(`block${x},${y}`);
    let targetRotation = 0;
    if (value === "x") {
      targetRotation = (2 * Math.PI) / 3;
    } else if (value === "o") {
      targetRotation = (-2 * Math.PI) / 3;
    }

    runAnimation(block!, [
      {
        property: "rotation.z",
        keys: [
          { frame: 0, value: block?.rotation.z },
          { frame: 40, value: targetRotation },
        ],
        easingFunction: value === "empty" ? new CubicEase() : new BackEase(),
      },
    ]);

    setTimeout(() => {
      runAnimation(block!, [
        {
          property: "position.y",
          keys: [
            { frame: 0, value: block?.position.y },
            { frame: 55, value: emphasisValue > 0 ? 0.5 : 0 },
          ],
          easingFunction:
            emphasisValue === 0 ? new CubicEase() : new BackEase(1.6),
        },
      ]);
    }, emphasisValue * 100);
  }

  getEffectiveBoard(state: RenderState<State, Config> | null) {
    return (
      state?.state?.board ??
      state?.config?.initialBoard ?? [
        ["empty", "empty", "empty"],
        ["empty", "empty", "empty"],
        ["empty", "empty", "empty"],
      ]
    );
  }

  async initialize() {
    this.scene = await SceneLoader.LoadAsync(
      ASSETS_PATH + "/",
      "tic-tac-toe.glb",
      this.engine
    );

    this.scene.performancePriority = ScenePerformancePriority.Intermediate;
    this.scene.clearColor = toBabylonColor("#2F343C").toColor4();

    this.camera = new Camera(this.engine, this.scene);

    new Ground(this.scene);
    this.createBlocks();
    this.createShadows();

    this.engine.runRenderLoop(() => {
      this.scene!.render();
    });
  }

  createBlocks() {
    const blockMeshes: Mesh[] = [];

    this.scene!.meshes.forEach((mesh) => {
      if (
        mesh instanceof Mesh &&
        (mesh.name === "OMesh" ||
          mesh.name === "XMesh" ||
          mesh.name === "BlockMesh")
      ) {
        blockMeshes.push(mesh);
      }

      if (mesh.name === "XMesh") {
        this.xMaterial = new SymbolMaterial(this.scene!);
        mesh.material = this.xMaterial.material;
      }

      if (mesh.name === "OMesh") {
        this.oMaterial = new SymbolMaterial(this.scene!);
        mesh.material = this.oMaterial.material;
      }

      if (mesh instanceof Mesh && mesh.name === "RodMesh") {
        for (let x = -1; x <= 1; x += 2) {
          const instance = mesh.createInstance("RobMesh," + x);
          instance.position.x = x * 3;
        }
      }
    });

    const blockMesh = Mesh.MergeMeshes(
      blockMeshes,
      true,
      undefined,
      undefined,
      undefined,
      true
    )!;
    blockMesh.rotation = new Vector3(0, 0, (2 * Math.PI) / 3);
    blockMesh.name = `block1,1`;

    const instances: InstancedMesh[] = [];

    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        if (x === 1 && y === 1) {
          this.updateBlock(x, y, "empty", 0);
          continue;
        }

        const mesh = blockMesh.createInstance(`block${x},${y}`);
        mesh.position.x = 3 * (x - 1);
        mesh.position.z = 3 * (y - 1);
        mesh.scaling.z = Math.random() > 0.5 ? 1 : -1;
        mesh.rotation.y = Math.random() > 0.5 ? 0 : Math.PI;
        instances.push(mesh);

        this.updateBlock(x, y, "empty", 0);
      }
    }
  }

  createShadows() {
    const shadowGenerators: ShadowGenerator[] = [];
    this.scene!.lights.forEach((light) => {
      light.intensity /= 160;
      if (light instanceof SpotLight) {
        const shadowGenerator = new ShadowGenerator(1024, light);
        shadowGenerator.usePercentageCloserFiltering = true;
        shadowGenerators.push(shadowGenerator);
      }
    });

    this.scene?.meshes.forEach((mesh) => {
      shadowGenerators.forEach((shadowGenerator) => {
        shadowGenerator.getShadowMap()?.renderList?.push(mesh);
      });

      if (!mesh.isAnInstance) {
        mesh.receiveShadows = true;
      }
    });
  }
};
