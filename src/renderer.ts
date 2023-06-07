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
} from "@babylonjs/core";
import "@babylonjs/loaders";
import { runAnimation, toBabylonColor } from "./ui/utils";
import { Camera } from "./ui/Camera";
import { SymbolMaterial } from "./ui/SymbolMaterial";
import { Ground } from "./ui/Ground";

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

    this.camera?.update(current.status, current.view);

    if (current.botColors[0] !== previous?.botColors[0] && this.xMaterial) {
      this.xMaterial.updateColor(current.botColors[0]);
    }

    if (current.botColors[1] !== previous?.botColors[1] && this.oMaterial) {
      this.oMaterial.updateColor(current.botColors[1]);
    }

    const currentBoard = this.getEffectiveBoard(current);
    const previousBoard = this.getEffectiveBoard(previous);

    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        if (currentBoard[x][y] !== previousBoard[x][y]) {
          this.positionBlock(x, y, currentBoard[x][y]);
        }
      }
    }
  }

  positionBlock(x: number, y: number, value: "x" | "o" | "empty") {
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
        easingFunction: new BackEase(),
      },
    ]);
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
          this.positionBlock(x, y, "empty");
          continue;
        }

        const mesh = blockMesh.createInstance(`block${x},${y}`);
        mesh.position.x = 3 * (x - 1);
        mesh.position.z = 3 * (y - 1);
        instances.push(mesh);

        this.positionBlock(x, y, "empty");
      }
    }
  }

  createShadows() {
    const shadowGenerators: ShadowGenerator[] = [];
    this.scene!.lights.forEach((light) => {
      light.intensity /= 230;
      if (light instanceof SpotLight) {
        const shadowGenerator = new ShadowGenerator(32, light, true);
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
