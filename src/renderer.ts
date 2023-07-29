import type { RenderParams, RenderState } from "zilch-game-engine";
import type { Config, State } from "./config";
import {
  Engine,
  Mesh,
  Scene,
  SceneLoader,
  ShadowGenerator,
  SpotLight,
  GlowLayer,
} from "@babylonjs/core";
import "@babylonjs/loaders";
import { applyMeshPerfFlags, toBabylonColor } from "./ui/utils";
import { Camera } from "./ui/Camera";
import { SymbolMaterial } from "./ui/SymbolMaterial";
import { Ground } from "./ui/Ground";
import { getOutcomeAndWinningLine } from "./play";
import { Block } from "./ui/Block";

Zilch.Renderer = class Renderer {
  #engine: Engine;
  #scene: Scene;

  #camera: Camera;

  #xMaterial: SymbolMaterial | null = null;
  #oMaterial: SymbolMaterial | null = null;
  #blocks = new Map<string, Block>();

  constructor(engine: Engine, scene: Scene) {
    this.#engine = engine;
    this.#scene = scene;

    scene.autoClear = false;
    scene.autoClearDepthAndStencil = false;
    scene.skipPointerMovePicking = true;
    scene.skipPointerDownPicking = true;
    scene.skipPointerUpPicking = true;
    scene.skipFrustumClipping = true;
    scene.renderingManager.maintainStateBetweenFrames = true;
    scene.clearColor = toBabylonColor("#2F343C").toColor4().toLinearSpace();

    this.#camera = new Camera(scene);

    new Ground(scene);
    this.#createBlocks();
    this.#createShadows();

    const gl = new GlowLayer("GlowLayer");
    gl.intensity = 4;

    this.#engine.runRenderLoop(() => {
      this.#scene.render();
    });
  }

  static async create(canvas: HTMLCanvasElement) {
    const engine = new Engine(canvas);
    engine.loadingScreen = new (class {
      hideLoadingUI() {}
      displayLoadingUI() {}
      loadingUIBackgroundColor = "";
      loadingUIText = "";
    })();

    const scene = await SceneLoader.LoadAsync(
      ASSETS_PATH + "/",
      "tic-tac-toe.glb",
      engine
    );

    return new Renderer(engine, scene);
  }

  render({ current, previous }: RenderParams<State, Config>) {
    if (
      current.dimensions.height !== previous?.dimensions.height ||
      current.dimensions.width !== previous.dimensions.width
    ) {
      this.#engine.resize();
    }

    this.#camera.setStatus(current.status);

    if (current.botColors[0] !== previous?.botColors[0] && this.#xMaterial) {
      this.#xMaterial.updateColor(current.botColors[0]);
    }

    if (current.botColors[1] !== previous?.botColors[1] && this.#oMaterial) {
      this.#oMaterial.updateColor(current.botColors[1]);
    }

    const currentBoard = this.#getEffectiveBoard(current);
    const previousBoard = this.#getEffectiveBoard(previous);

    const currentWinningLine = this.#getWinningLine(currentBoard);
    const previousWinningLine = this.#getWinningLine(previousBoard);

    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        const currentSpotEmphasis =
          current.status === "done"
            ? currentWinningLine.getSpotEmphasis(x, y) ||
              this.#getErrorEmphasis(current, x, y)
            : 0;
        const previousSpotEmphasis =
          previous?.status === "done"
            ? previousWinningLine.getSpotEmphasis(x, y) ||
              this.#getErrorEmphasis(previous, x, y)
            : 0;

        if (
          currentBoard[x][y] !== previousBoard[x][y] ||
          currentSpotEmphasis !== previousSpotEmphasis
        ) {
          this.#blocks
            .get(`${x},${y}`)
            ?.update(currentBoard[x][y], currentSpotEmphasis);
        }
      }
    }
  }

  #getWinningLine(board: ("empty" | "x" | "o")[][]) {
    const winningLine = (
      getOutcomeAndWinningLine({ board, errorEmphasisSpot: null })
        ?.winningLine ?? []
    ).map((move) => `${move.x},${move.y}`);
    return {
      getSpotEmphasis(x: number, y: number) {
        return winningLine.findIndex((value) => `${x},${y}` === value) + 1;
      },
    };
  }

  #getErrorEmphasis(
    state: RenderState<State, Config> | null,
    x: number,
    y: number
  ) {
    if (
      state?.state?.errorEmphasisSpot?.x === x &&
      state.state.errorEmphasisSpot.y === y
    ) {
      return -1;
    } else {
      return 0;
    }
  }

  #getEffectiveBoard(state: RenderState<State, Config> | null) {
    return (
      state?.state?.board ??
      state?.config?.initialBoard ?? [
        ["empty", "empty", "empty"],
        ["empty", "empty", "empty"],
        ["empty", "empty", "empty"],
      ]
    );
  }

  #createBlocks() {
    let oMesh: Mesh | undefined;
    let xMesh: Mesh | undefined;
    let blockMesh: Mesh | undefined;

    this.#scene.meshes.forEach((mesh) => {
      applyMeshPerfFlags(mesh);

      if (mesh instanceof Mesh) {
        if (mesh.name === "OMesh") {
          oMesh = mesh;
        } else if (mesh.name === "XMesh") {
          xMesh = mesh;
        } else if (mesh.name === "BlockMesh") {
          blockMesh = mesh;
        }
      }

      if (mesh.name === "XMesh") {
        this.#xMaterial = new SymbolMaterial(this.#scene);
        mesh.material = this.#xMaterial.material;
      }

      if (mesh.name === "OMesh") {
        this.#oMaterial = new SymbolMaterial(this.#scene);
        mesh.material = this.#oMaterial.material;
      }

      if (mesh instanceof Mesh && mesh.name === "RodMesh") {
        for (let x = -1; x <= 1; x += 2) {
          const instance = mesh.createInstance("RobMesh," + x);
          instance.position.x = x * 3;
        }
      }
    });

    if (!oMesh || !xMesh || !blockMesh) {
      throw new Error("Didn't load expected mesh.");
    }

    oMesh.isVisible = false;
    xMesh.isVisible = false;
    blockMesh.isVisible = false;

    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        const block = new Block(blockMesh, oMesh, xMesh, x, y);
        block.update("empty", 0);
        this.#blocks.set(`${x},${y}`, block);
      }
    }
  }

  #createShadows() {
    const shadowGenerators: ShadowGenerator[] = [];
    this.#scene.lights.forEach((light) => {
      light.intensity /= 170;
      if (light instanceof SpotLight) {
        const shadowGenerator = new ShadowGenerator(1024, light);
        shadowGenerator.usePercentageCloserFiltering = true;
        shadowGenerators.push(shadowGenerator);
      }
    });

    this.#scene.meshes.forEach((mesh) => {
      if (mesh.name.startsWith("HighlightMesh")) {
        shadowGenerators.forEach((shadowGenerator) => {
          shadowGenerator.removeShadowCaster(mesh);
        });
        return;
      }

      shadowGenerators.forEach((shadowGenerator) => {
        shadowGenerator.getShadowMap()?.renderList?.push(mesh);
      });

      if (!mesh.isAnInstance) {
        mesh.receiveShadows = true;
      }
    });
  }
};
