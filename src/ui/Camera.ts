import {
  Engine,
  ArcRotateCamera,
  CubicEase,
  Scene,
  Vector3,
} from "@babylonjs/core";
import { getNearestStep, runAnimation } from "./utils";
import { GameStatus, RendererView } from "zilch-game-engine";

export class Camera {
  private camera: ArcRotateCamera;
  private status: GameStatus = "not-started";
  private view: RendererView | null = null;
  private initialUpdate = true;

  private initialBeta = Math.PI * 0.26;
  private initialAlpha = Math.PI * 2.65;

  constructor(private engine: Engine, scene: Scene) {
    const zoomRadius = 18;
    this.camera = new ArcRotateCamera(
      "camera",
      this.initialAlpha,
      this.initialBeta,
      zoomRadius,
      new Vector3(0, -1, 0),
      scene
    );

    this.camera.radius = zoomRadius;
    this.camera.lowerRadiusLimit = zoomRadius;
    this.camera.upperRadiusLimit = zoomRadius;
    this.camera.upperBetaLimit = Math.PI * 0.4;
  }

  update(status: GameStatus, view: RendererView) {
    if (status === this.status && view === this.view && !this.initialUpdate) {
      return;
    }

    const current = this.getTargetState(status, view);
    const previous = this.getTargetState(this.status, this.view ?? "3D");

    this.status = status;
    this.view = view;

    if (current.autoRotate !== previous.autoRotate || this.initialUpdate) {
      this.camera.useAutoRotationBehavior = current.autoRotate;
    }

    if (
      current.cameraAttached !== previous.cameraAttached ||
      this.initialUpdate
    ) {
      if (current.cameraAttached) {
        this.camera.attachControl();
      } else {
        this.camera.detachControl();
      }
    }

    if (
      current.cameraView !== previous.cameraView ||
      (current.status === "in-progress" && previous.status === "done") ||
      this.initialUpdate
    ) {
      runAnimation(this.camera, [
        {
          property: "alpha",
          keys: [
            { frame: 0, value: this.camera.alpha },
            {
              frame: 30,
              value: getNearestStep(
                current.cameraView === "top" ? Math.PI : this.initialAlpha,
                this.camera.alpha,
                Math.PI / 2
              ),
            },
          ],
          easingFunction: new CubicEase(),
        },
        {
          property: "beta",
          keys: [
            { frame: 0, value: this.camera.beta },
            {
              frame: 30,
              value: current.cameraView === "top" ? 0 : this.initialBeta,
            },
          ],
          easingFunction: new CubicEase(),
        },
      ]);
    }

    this.initialUpdate = false;
  }

  getTargetState(status: GameStatus, view: RendererView) {
    return {
      autoRotate: status === "not-started" && view !== "2D",
      cameraAttached: view === "3D",
      status,
      cameraView:
        view === "2D"
          ? "top"
          : status === "in-progress" || status === "done"
          ? "initial"
          : undefined,
    };
  }
}
