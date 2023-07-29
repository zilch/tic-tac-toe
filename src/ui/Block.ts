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
import {
  applyMeshPerfFlags,
  getNearestStep,
  runAnimation,
  stopAnimations,
  toBabylonColor,
} from "./utils";

const GOOD_EMPHASIS_COLOR = toBabylonColor("rgb(243,191,123)");
const BAD_EMPHASIS_COLOR = toBabylonColor("#ff0000");

export class Block {
  #node: TransformNode;
  #highlightMaterial: StandardMaterial;

  constructor(blockMesh: Mesh, oMesh: Mesh, xMesh: Mesh, x: number, y: number) {
    this.#node = new TransformNode(`transformNode${x},${y}`);
    this.#node.position.x = 3 * (1 - x);
    this.#node.position.z = 3 * (1 - y);
    this.#node.scaling.z = Math.random() > 0.5 ? 1 : -1;
    this.#node.rotation = new Vector3(
      0,
      Math.random() > 0.5 ? 0 : Math.PI,
      (2 * Math.PI) / 3
    );

    applyMeshPerfFlags(blockMesh.createInstance(`BlockMesh${x},${y}`)).parent =
      this.#node;
    applyMeshPerfFlags(xMesh.createInstance(`OMesh${x},${y}`)).parent =
      this.#node;
    applyMeshPerfFlags(oMesh.createInstance(`OMesh${x},${y}`)).parent =
      this.#node;

    const highlightMesh = MeshBuilder.CreateCylinder(`HighlightMesh${x},${y}`, {
      height: 2.1,
      tessellation: 3,
      diameter: 2.4,
    });
    applyMeshPerfFlags(highlightMesh);
    highlightMesh.rotation.z = -Math.PI / 2;
    highlightMesh.rotation.y = Math.PI / 2;
    highlightMesh.parent = this.#node;

    this.#highlightMaterial = new StandardMaterial(
      `HighlightMaterial${x},${y}`
    );
    this.#highlightMaterial.alpha = 0;
    this.#highlightMaterial.emissiveColor = GOOD_EMPHASIS_COLOR.clone();
    highlightMesh.material = this.#highlightMaterial;
  }

  update(value: "x" | "o" | "empty", emphasis: number) {
    stopAnimations(this.#node);
    stopAnimations(this.#highlightMaterial);

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
        frames: {
          0: this.#node.rotation.z,
          40: targetRotation,
        },
        easingFunction:
          value === "empty" && emphasis !== -1
            ? new CubicEase()
            : new BackEase(),
      },
    ]);

    const delay = Math.abs(emphasis) * 5;

    runAnimation(this.#node, [
      {
        property: "position.y",
        frames: { 0: this.#node.position.y, 65: emphasis > 0 ? 0.3 : 0 },
        easingFunction:
          emphasis < 1 || this.#node.position.y !== 0
            ? new CubicEase()
            : new BackEase(4),
        delay,
      },
    ]);

    const targetColor =
      emphasis === -1
        ? BAD_EMPHASIS_COLOR.clone()
        : GOOD_EMPHASIS_COLOR.clone();

    runAnimation(this.#highlightMaterial, [
      ...(["r", "g", "b"] as const).map((color) => {
        return {
          property: "emissiveColor." + color,
          frames: {
            0: this.#highlightMaterial.emissiveColor[color],
            40: targetColor[color],
          },
          delay,
        };
      }),
      {
        property: "alpha",
        frames: {
          0: this.#highlightMaterial.alpha,
          [emphasis > 0 ? 65 : 40]:
            emphasis > 0 ? 0.02 : emphasis < 0 ? 0.1 : 0,
        },
        easingFunction:
          emphasis === 0 || this.#highlightMaterial.alpha !== 0
            ? new SineEase()
            : new BackEase(emphasis > 0 ? 13 : 2),
        delay,
      },
    ]);
  }
}
