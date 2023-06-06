import type { RenderParams } from "zilch-game-engine";
import type { Config, State } from "./config";
import {
  ArcRotateCamera,
  Color3,
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

  constructor(canvas: HTMLCanvasElement) {
    this.engine = new Engine(canvas);
    this.initialize();
  }

  render({ current, previous }: RenderParams<State, Config>) {
    if (
      current.dimensions.height !== previous?.dimensions.height ||
      current.dimensions.width !== previous.dimensions.width
    ) {
      this.engine.resize();
    }
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
      false
    )!;
    blockMesh.rotation = new Vector3(0, 0, Math.PI);
    blockMesh.name = `block1,1`;

    const instances: InstancedMesh[] = [];

    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        if (x === 1 && y === 1) {
          continue;
        }

        const mesh = blockMesh.createInstance(`block${x},${y}`);
        mesh.position.x = 3 * (x - 1);
        mesh.position.z = 3 * (y - 1);
        instances.push(mesh);
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
