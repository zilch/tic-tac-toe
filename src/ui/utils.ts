import {
  Material,
  EasingFunction,
  Animation,
  Node,
  Color3,
} from "@babylonjs/core";
import * as csx from "csx";

export function toBabylonColor(colorValue: string) {
  const color = csx.color(colorValue);
  return new Color3(color.red() / 255, color.green() / 255, color.blue() / 255);
}

export function getNearestStep(target: number, current: number, step: number) {
  const diff = target - current;
  const stepCount = Math.floor(Math.abs(diff) / step);
  return target + (diff > 0 ? step * -stepCount : step * stepCount);
}

export function runAnimation(
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
