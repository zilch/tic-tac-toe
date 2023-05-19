import type { RenderParams } from "zilch-game-engine";
import type { State } from "./state";
import type { Config } from "./config";

export class Renderer {
  container: HTMLPreElement;

  constructor(canvas: HTMLCanvasElement) {
    this.container = document.createElement("pre");
    this.container.style.position = "absolute";
    this.container.style.display = "flex";
    this.container.style.alignItems = "center";
    this.container.style.justifyContent = "center";
    this.container.style.fontFamily = "monospace";
    this.container.style.top = "20px";
    this.container.style.bottom = "20px";
    this.container.style.left = "20px";
    this.container.style.right = "20px";
    this.container.style.color = "white";
    document.body.appendChild(this.container);
  }
  render(params: RenderParams<State, Config>) {
    this.container.innerText = JSON.stringify(params, null, 2);
  }
}
