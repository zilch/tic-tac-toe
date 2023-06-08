import {
  Engine,
  ArcRotateCamera,
  Scene,
  Vector3,
  PointerEventTypes,
  CubicEase,
} from "@babylonjs/core";
import { GameStatus } from "zilch-game-engine";
import {
  addStyle,
  getNearestStep,
  runAnimation,
  stopAnimations,
} from "./utils";

interface CameraState {
  topView: boolean;
  status: GameStatus;
}

const INITIAL_ALPHA = Math.PI * 2.65;
const INITIAL_BETA = Math.PI * 0.26;

export class Camera {
  #camera: ArcRotateCamera;
  #topView = false;
  #status: GameStatus = "not-started";

  constructor(private engine: Engine, scene: Scene) {
    const zoomRadius = 18;
    this.#camera = new ArcRotateCamera(
      "camera",
      INITIAL_ALPHA,
      INITIAL_BETA,
      zoomRadius,
      new Vector3(0, -1, 0),
      scene
    );

    this.#camera.radius = zoomRadius;
    this.#camera.lowerRadiusLimit = zoomRadius;
    this.#camera.upperRadiusLimit = zoomRadius;
    this.#camera.upperBetaLimit = Math.PI * 0.4;
    this.#camera.useAutoRotationBehavior = true;
    this.#camera.attachControl();

    addStyle(`
      canvas {
        cursor: grab;
      }

      canvas.moving {
        cursor: grabbing;
      }
    `);

    const canvas = document.querySelector("canvas")!;

    scene.onPointerObservable.add((event) => {
      if (event.type === PointerEventTypes.POINTERDOWN) {
        canvas.classList.add("moving");
        stopAnimations(this.#camera);
      }

      if (event.type === PointerEventTypes.POINTERUP) {
        canvas.classList.remove("moving");

        this.#topView = this.#camera.beta < 0.15;

        if (this.#topView) {
          this.#camera.useAutoRotationBehavior = false;
          this.#animateTo(
            getNearestStep(Math.PI, this.#camera.alpha, Math.PI / 2),
            0
          );
        } else if (this.#status === "not-started") {
          this.#camera.useAutoRotationBehavior = true;
        }
      }
    });
  }

  setStatus(newStatus: GameStatus) {
    if (newStatus === "in-progress" && this.#status !== "in-progress") {
      this.#camera.useAutoRotationBehavior = false;

      if (!this.#topView) {
        this.#animateTo(
          getNearestStep(INITIAL_ALPHA, this.#camera.alpha, Math.PI / 2),
          INITIAL_BETA
        );
      }
    }

    if (
      newStatus === "not-started" &&
      this.#status !== "not-started" &&
      !this.#topView
    ) {
      this.#camera.useAutoRotationBehavior = true;
    }

    this.#status = newStatus;
  }

  #animateTo(alpha: number, beta: number) {
    runAnimation(this.#camera, [
      {
        property: "alpha",
        keys: [
          { frame: 0, value: this.#camera.alpha },
          {
            frame: 30,
            value: alpha,
          },
        ],
        easingFunction: new CubicEase(),
      },
      {
        property: "beta",
        keys: [
          { frame: 0, value: this.#camera.beta },
          {
            frame: 30,
            value: beta,
          },
        ],
        easingFunction: new CubicEase(),
      },
    ]);
  }
}
