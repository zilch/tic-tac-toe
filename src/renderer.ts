import type { RenderParams } from "zilch-game-engine";
import type { Config, State } from "./config";
import {
  ArcRotateCamera,
  Color3,
  Engine,
  HemisphericLight,
  MeshBuilder,
  PointLight,
  Scene,
  SceneLoader,
  ScenePerformancePriority,
  ShadowGenerator,
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

  constructor(canvas: HTMLCanvasElement) {
    this.engine = new Engine(canvas, true, {}, true);

    const loadIt = async () => {
      const scene = await SceneLoader.LoadAsync(
        ASSETS_PATH + "/",
        "tic-tac-toe.glb",
        this.engine
      );
      scene.performancePriority = ScenePerformancePriority.Aggressive;

      const shadowGenerators: ShadowGenerator[] = [];
      scene.lights.forEach((light) => {
        light.intensity *= (0.03 * 8000) / 163054.2392;
        if (light instanceof PointLight) {
          shadowGenerators.push(new ShadowGenerator(1024, light));
        }
      });
      scene.meshes.forEach((mesh) => {
        shadowGenerators.forEach((shadowGenerator) => {
          shadowGenerator.getShadowMap()?.renderList?.push(mesh);
        });
        mesh.receiveShadows = true;
      });

      new HemisphericLight("mainLight", Vector3.Zero(), scene);

      const initialBeta = Math.PI * 0.22;
      const initialAlpha = Math.PI * 2.75;

      const zoomRadius = 22;
      const camera = new ArcRotateCamera(
        "camera",
        initialAlpha,
        initialBeta,
        zoomRadius,
        new Vector3(0, -3, 0),
        scene
      );
      camera.attachControl(canvas, false);
      camera.radius = zoomRadius;
      camera.lowerRadiusLimit = zoomRadius;
      camera.upperRadiusLimit = zoomRadius;
      camera.upperBetaLimit = Math.PI * 0.24;
      camera.useAutoRotationBehavior = true;
      scene.clearColor = toBabylonColor("#2F343C").toColor4();

      this.engine.runRenderLoop(() => {
        scene.render();
      });
    };

    loadIt();
  }
  render({ current, previous }: RenderParams<State, Config>) {
    if (
      current.dimensions.height !== previous?.dimensions.height ||
      current.dimensions.width !== previous.dimensions.width
    ) {
      this.engine.resize();
    }
  }
};
