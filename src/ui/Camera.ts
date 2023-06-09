import {
  ArcRotateCamera,
  Scene,
  Vector3,
  PointerEventTypes,
  CubicEase,
  BackEase,
} from "@babylonjs/core";
import { GameStatus } from "zilch-game-engine";
import {
  addStyle,
  getNearestStep,
  runAnimation,
  stopAnimations,
} from "./utils";

const INITIAL_ALPHA = Math.PI * 2.65;
const INITIAL_BETA = Math.PI * 0.26;

export class Camera {
  #camera: ArcRotateCamera;
  #topView = false;
  #status: GameStatus = "not-started";

  constructor(scene: Scene) {
    this.#camera = new ArcRotateCamera(
      "camera",
      INITIAL_ALPHA,
      INITIAL_BETA,
      22,
      new Vector3(0, -1, 0),
      scene
    );

    this.#camera.lowerRadiusLimit = 14;
    this.#camera.upperRadiusLimit = 24;
    this.#camera.panningSensibility = 0;
    this.#camera.upperBetaLimit = Math.PI * 0.4;
    this.#camera.useAutoRotationBehavior = true;
    this.#camera.attachControl();

    runAnimation(this.#camera, [
      {
        property: "radius",
        keys: [
          { frame: 0, value: this.#camera.radius },
          { frame: 90, value: 18 },
        ],
        easingFunction: new BackEase(),
        easingMode: "out",
      },
    ]);

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

        this.#topView = this.#camera.beta < 0.3;

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
