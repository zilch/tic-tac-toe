import { Scene, PBRMaterial } from "@babylonjs/core";
import { runAnimation, toBabylonColor } from "./utils";
import * as csx from "csx";

export class SymbolMaterial {
  material: PBRMaterial;

  constructor(scene: Scene) {
    this.material = new PBRMaterial("OMaterial", scene);
    this.material.albedoColor = this.createSymbolColor(null);
    this.material.roughness = 1;
  }

  updateColor(color: string | null | undefined) {
    const newColor = this.createSymbolColor(color);
    runAnimation(
      this.material,
      (["r", "g", "b"] as const).map((c) => {
        return {
          property: "albedoColor." + c,
          frames: {
            0: this.material.albedoColor[c],
            16: newColor[c],
          },
        };
      })
    );
  }

  createSymbolColor(baseColor: string | null | undefined) {
    if (!baseColor) {
      return toBabylonColor("#5E4123");
    }

    return toBabylonColor(csx.color(baseColor).darken(0.2).toString());
  }
}
