import type { RenderParams } from "zilch-game-engine";
import type { State } from "./index";
import type { Config } from "./index";
import {
  ArcRotateCamera,
  Color3,
  Engine,
  HemisphericLight,
  MeshBuilder,
  Scene,
  ScenePerformancePriority,
  Vector3,
} from "@babylonjs/core";
import * as csx from "csx";

export function toBabylonColor(colorValue: string) {
  const color = csx.color(colorValue);
  return new Color3(color.red() / 255, color.green() / 255, color.blue() / 255);
}

export class Renderer {
  engine: Engine;

  constructor(canvas: HTMLCanvasElement) {
    fetch(ASSETS_PATH + "/hello.txt")
      .then((response) => response.text())
      .then((value) => console.log(value));

    this.engine = new Engine(canvas, true, {}, true);
    const scene = new Scene(this.engine);
    scene.performancePriority = ScenePerformancePriority.Aggressive;

    const mainLight = new HemisphericLight("mainLight", Vector3.Zero(), scene);
    mainLight.groundColor = Color3.White();
    mainLight.specular = Color3.Black();

    const initialBeta = Math.PI * 0.24;
    const initialAlpha = Math.PI * 2.75;

    const zoomRadius = 50;
    const camera = new ArcRotateCamera(
      "camera",
      initialAlpha,
      initialBeta,
      zoomRadius,
      Vector3.Zero(),
      scene
    );
    camera.attachControl(canvas, false);
    camera.radius = zoomRadius;
    camera.lowerRadiusLimit = zoomRadius;
    camera.upperRadiusLimit = zoomRadius;
    camera.upperBetaLimit = Math.PI * 0.24;
    camera.useAutoRotationBehavior = true;
    scene.clearColor = toBabylonColor("#559900").toColor4();

    MeshBuilder.CreateBox("lightBackground", {
      size: 3,
      faceColors: [
        toBabylonColor("#00bb33").toColor4(),
        toBabylonColor("#00bb33").toColor4(),
        toBabylonColor("#aa0000").toColor4(),
        toBabylonColor("#aa0000").toColor4(),
        toBabylonColor("#ff0000").toColor4(),
        toBabylonColor("#ff0000").toColor4(),
      ],
    });

    this.engine.runRenderLoop(() => {
      scene.render();
    });
  }
  render({ current, previous }: RenderParams<State, Config>) {
    if (
      current.dimensions.height !== previous?.dimensions.height ||
      current.dimensions.width !== previous.dimensions.width
    ) {
      this.engine.resize();
    }
  }
}
