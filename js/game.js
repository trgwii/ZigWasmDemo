//@ts-check
const canvas = document.querySelector("canvas");
if (!canvas) throw new Error("fuck");
const ctx = canvas.getContext("2d", { alpha: false });
if (!ctx) throw new Error("fuck");

document.body.style.margin = "0px";
document.body.style.overflow = "hidden";

import { mem, render, resizeScreen, setKeys, update } from "./wasm.js";

let keys = setKeys("Up", false, 0);
let game = update(0, 0, canvas.width, canvas.height);

addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp" || e.key === "W") keys = setKeys("Up", true, keys);
  if (e.key === "ArrowLeft" || e.key === "A") {
    keys = setKeys("Left", true, keys);
  }
  if (e.key === "ArrowDown" || e.key === "S") {
    keys = setKeys("Down", true, keys);
  }
  if (e.key === "ArrowRight" || e.key === "D") {
    keys = setKeys("Right", true, keys);
  }
});
addEventListener("keyup", (e) => {
  if (e.key === "ArrowUp" || e.key === "W") keys = setKeys("Up", false, keys);
  if (e.key === "ArrowLeft" || e.key === "A") {
    keys = setKeys("Left", false, keys);
  }
  if (e.key === "ArrowDown" || e.key === "S") {
    keys = setKeys("Down", false, keys);
  }
  if (e.key === "ArrowRight" || e.key === "D") {
    keys = setKeys("Right", false, keys);
  }
});

let screen = resizeScreen(canvas.width, canvas.height);
let arr = new Uint8ClampedArray(
  mem.buffer,
  screen,
  canvas.width * canvas.height * 4,
);
let img = new ImageData(arr, canvas.width, canvas.height);

const resize = (/** @type {number} */ w, /** @type {number} */ h) => {
  screen = resizeScreen(w, h, screen);
  arr = new Uint8ClampedArray(
    mem.buffer,
    screen,
    w * h * 4,
  );
  img = new ImageData(arr, w, h);
};

canvas.width = innerWidth;
canvas.height = innerHeight;
resize(canvas.width, canvas.height);

addEventListener("resize", () => {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  resize(canvas.width, canvas.height);
});

const loop = () => {
  const x = 0;
  const y = 0;
  const w = canvas.width;
  const h = canvas.height;

  game = update(game, keys, w, h);
  render(game, screen, w, h);

  ctx.putImageData(img, x, y);

  requestAnimationFrame(loop);
};
loop();

export {};
