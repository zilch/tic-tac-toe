import type { RenderParams, RenderState } from "zilch-game-engine";
import type { Config, State } from "./config";
import {
  Animation,
  ArcRotateCamera,
  Color3,
  DynamicTexture,
  EasingFunction,
  Node,
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
  Material,
  BackEase,
} from "@babylonjs/core";
import "@babylonjs/loaders";
import * as csx from "csx";

export function toBabylonColor(colorValue: string) {
  const color = csx.color(colorValue);
  return new Color3(color.red() / 255, color.green() / 255, color.blue() / 255);
}

Zilch.Renderer = class {
  engine: Engine;
  scene: Scene | null = null;
  xMaterial: PBRMaterial | null = null;
  oMaterial: PBRMaterial | null = null;
  initializeOperation: Promise<void>;

  constructor(canvas: HTMLCanvasElement) {
    this.engine = new Engine(canvas);
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

    if (current.botColors[0] !== previous?.botColors[0] && this.xMaterial) {
      this.xMaterial.albedoColor = this.createSymbolColor(current.botColors[0]);
    }

    if (current.botColors[1] !== previous?.botColors[1] && this.oMaterial) {
      this.oMaterial.albedoColor = this.createSymbolColor(current.botColors[1]);
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

  createSymbolColor(baseColor: string | null) {
    if (baseColor === null) {
      return toBabylonColor("#946638");
    }

    return toBabylonColor(csx.color(baseColor).darken(0.1).toString());
  }

  async initialize() {
    this.scene = await SceneLoader.LoadAsync(
      ASSETS_PATH + "/",
      "tic-tac-toe.glb",
      this.engine
    );

    this.scene.performancePriority = ScenePerformancePriority.Intermediate;
    this.scene.clearColor = toBabylonColor("#2F343C").toColor4();

    this.createCamera();
    this.createGround();
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
        this.xMaterial = new PBRMaterial("XMaterial", this.scene!);
        this.xMaterial.albedoColor = this.createSymbolColor(null);
        this.xMaterial.roughness = 0.9;
        mesh.material = this.xMaterial;
      }

      if (mesh.name === "OMesh") {
        this.oMaterial = new PBRMaterial("OMaterial", this.scene!);
        this.oMaterial.albedoColor = this.createSymbolColor(null);
        this.oMaterial.roughness = 0.9;
        mesh.material = this.oMaterial;
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
        const shadowGenerator = new ShadowGenerator(512, light);
        shadowGenerator.usePercentageCloserFiltering = true;
        shadowGenerators.push(shadowGenerator);
      }
    });
    this.scene?.meshes.forEach((mesh) => {
      shadowGenerators.forEach((shadowGenerator) => {
        shadowGenerator.getShadowMap()?.renderList?.push(mesh);
      });
      mesh.receiveShadows = true;
    });
  }

  createCamera() {
    const initialBeta = Math.PI * 0.2;
    const initialAlpha = Math.PI * 2.65;

    const zoomRadius = 19;
    const camera = new ArcRotateCamera(
      "camera",
      initialAlpha,
      initialBeta,
      zoomRadius,
      new Vector3(0, -2, 0),
      this.scene!
    );

    camera.attachControl(this.engine.getRenderingCanvas()!, false);
    camera.radius = zoomRadius;
    camera.lowerRadiusLimit = zoomRadius;
    camera.upperRadiusLimit = zoomRadius;
    camera.upperBetaLimit = Math.PI * 0.4;
    camera.useAutoRotationBehavior = true;
  }

  createGround() {
    const radius = 40;

    // Texture
    const groundTexture = new DynamicTexture(
      "GroundTexture",
      { width: radius * 2, height: radius * 2 },
      this.scene,
      false
    );
    const ctx = groundTexture.getContext();
    const gradient = ctx.createRadialGradient(
      radius,
      radius,
      0,
      radius,
      radius,
      radius
    );
    gradient.addColorStop(0, "rgba(56, 62, 71, .5)");
    gradient.addColorStop(1, "rgba(56, 62, 71, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, radius * 2, radius * 2);
    groundTexture.update();

    // Material
    const groundMaterial = new PBRMaterial("GroundMaterial", this.scene!);
    groundMaterial.roughness = 0.8;
    groundTexture.hasAlpha = true;
    groundMaterial.albedoTexture = groundTexture;
    groundMaterial.useAlphaFromAlbedoTexture = true;

    // Mesh
    const groundMesh = MeshBuilder.CreateDisc(
      "GroundMesh",
      {
        radius: radius,
        tessellation: 30,
      },
      this.scene
    );
    groundMesh.material = groundMaterial;
    groundMesh.rotation.x = Math.PI / 2;
    groundMesh.position.y = -1.35;
  }
};

function runAnimation(
  target: Node | Material,
  animationData: {
    property: string;
    keys: {
      frame: number;
      value: unknown;
    }[];
    easingFunction?: EasingFunction;
    easingMode?: "inout" | "in" | "out";
  }[],
  options: {
    maxFrame?: number;
    easingFunction?: EasingFunction;
    easingMode?: "inout" | "in" | "out";
  } = {}
) {
  return new Promise<void>((resolve) => {
    const animations = animationData.map((data) => {
      const animation = new Animation(
        "animation",
        data.property,
        60,
        typeof data.keys[0].value === "number"
          ? Animation.ANIMATIONTYPE_FLOAT
          : Animation.ANIMATIONTYPE_VECTOR3
      );
      animation.setKeys(data.keys);

      const easingFunction = data.easingFunction ?? options.easingFunction;

      if (easingFunction) {
        easingFunction.setEasingMode(
          {
            in: EasingFunction.EASINGMODE_EASEIN,
            out: EasingFunction.EASINGMODE_EASEOUT,
            inout: EasingFunction.EASINGMODE_EASEINOUT,
          }[data.easingMode ?? options.easingMode ?? "inout"]
        );

        animation.setEasingFunction(easingFunction);
      }

      return animation;
    });

    const maxFrame =
      options.maxFrame ??
      Math.max(
        ...animationData.flatMap(({ keys }) => keys.map((key) => key.frame))
      );

    target
      .getScene()
      .beginDirectAnimation(target, animations, 0, maxFrame, false, 1, resolve);
  });
}
