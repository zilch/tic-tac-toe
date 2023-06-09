import {
  BackEase,
  CubicEase,
  Mesh,
  MeshBuilder,
  SineEase,
  StandardMaterial,
  TransformNode,
  Vector3,
} from "@babylonjs/core";
import { getNearestStep, runAnimation, toBabylonColor } from "./utils";

const GOOD_EMPHASIS_COLOR = toBabylonColor("rgb(243,191,123)");
const BAD_EMPHASIS_COLOR = toBabylonColor("#ff0000");

export class Block {
  #node: TransformNode;
  #timeoutId: number | null = null;
  #highlightMaterial: StandardMaterial;

  constructor(blockMesh: Mesh, oMesh: Mesh, xMesh: Mesh, x: number, y: number) {
    this.#node = new TransformNode(`transformNode${x},${y}`);
    this.#node.position.x = 3 * (y - 1);
    this.#node.position.z = 3 * (1 - x);
    this.#node.scaling.z = Math.random() > 0.5 ? 1 : -1;
    this.#node.rotation = new Vector3(
      0,
      Math.random() > 0.5 ? 0 : Math.PI,
      (2 * Math.PI) / 3
    );

    blockMesh.createInstance(`BlockMesh${x},${y}`).parent = this.#node;
    xMesh.createInstance(`OMesh${x},${y}`).parent = this.#node;
    oMesh.createInstance(`OMesh${x},${y}`).parent = this.#node;

    const highlightMesh = MeshBuilder.CreateCylinder(`HighlightMesh${x},${y}`, {
      height: 2.1,
      tessellation: 3,
      diameter: 2.4,
    });
    highlightMesh.rotation.z = -Math.PI / 2;
    highlightMesh.rotation.y = Math.PI / 2;
    highlightMesh.parent = this.#node;

    this.#highlightMaterial = new StandardMaterial(
      `HighlightMaterial${x},${y}`
    );
    this.#highlightMaterial.alpha = 0;
    this.#highlightMaterial.emissiveColor = GOOD_EMPHASIS_COLOR;
    highlightMesh.material = this.#highlightMaterial;
  }

  update(value: "x" | "o" | "empty", emphasis: number) {
    if (this.#timeoutId !== null) {
      clearTimeout(this.#timeoutId);
    }

    let targetRotation = 0;

    if (value === "x") {
      targetRotation = (-2 * Math.PI) / 3;
    } else if (value === "o") {
      targetRotation = (2 * Math.PI) / 3;
    }

    if (emphasis === -1) {
      targetRotation = Math.PI;
    }

    targetRotation = getNearestStep(
      targetRotation,
      this.#node.rotation.z,
      Math.PI * 2
    );

    runAnimation(this.#node, [
      {
        property: "rotation.z",
        keys: [
          { frame: 0, value: this.#node.rotation.z },
          { frame: 40, value: targetRotation },
        ],
        easingFunction:
          value === "empty" && emphasis !== -1
            ? new CubicEase()
            : new BackEase(),
      },
    ]);

    this.#timeoutId = setTimeout(() => {
      this.#timeoutId = null;
      runAnimation(this.#node, [
        {
          property: "position.y",
          keys: [
            { frame: 0, value: this.#node.position.y },
            { frame: 65, value: emphasis > 0 ? 0.3 : 0 },
          ],
          easingFunction: emphasis < 1 ? new CubicEase() : new BackEase(4),
        },
      ]);

      const targetColor =
        emphasis === -1 ? BAD_EMPHASIS_COLOR : GOOD_EMPHASIS_COLOR;

      runAnimation(this.#highlightMaterial, [
        ...(["r", "g", "b"] as const).map((color) => {
          return {
            property: "emissiveColor." + color,
            keys: [
              {
                frame: 0,
                value: this.#highlightMaterial.emissiveColor[color],
              },
              {
                frame: 40,
                value: targetColor[color],
              },
            ],
          };
        }),
        {
          property: "alpha",
          keys: [
            {
              frame: 0,
              value: this.#highlightMaterial.alpha,
            },
            {
              frame: emphasis > 0 ? 65 : 40,
              value: emphasis > 0 ? 0.02 : emphasis < 0 ? 0.1 : 0,
            },
          ],
          easingFunction:
            emphasis === 0
              ? new SineEase()
              : new BackEase(emphasis > 0 ? 13 : 2),
        },
      ]);
    }, Math.abs(emphasis) * 80);
  }
}
