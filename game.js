//@ts-check
const canvas = document.querySelector("canvas");
if (!canvas) throw new Error("fuck");
const ctx = canvas.getContext("2d");
if (!ctx) throw new Error("fuck");

document.body.style.margin = "0px";
document.body.style.overflow = "hidden";

canvas.width = innerWidth;
canvas.height = innerHeight;

let screenBufferSize = canvas.width * canvas.height * 4;
const pageSize = 64 * 1024;
let screenBufferSizeInPages = Math.ceil(screenBufferSize / pageSize);

const resizeHandler = (/** @type {WebAssembly.Memory} */ memory) => () => {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  const oldScreenBufferSize = screenBufferSize;
  const oldScreenBufferSizeInPages = screenBufferSizeInPages;
  screenBufferSize = canvas.width * canvas.height * 4;
  screenBufferSizeInPages = Math.ceil(screenBufferSize / pageSize);
  console.log({
    oldScreenBufferSize,
    oldScreenBufferSizeInPages,
    screenBufferSize,
    screenBufferSizeInPages,
  });
  if (screenBufferSize < oldScreenBufferSize) {
    screenBufferSize = oldScreenBufferSize;
    screenBufferSizeInPages = Math.ceil(screenBufferSize / pageSize);
  } else if (screenBufferSizeInPages > oldScreenBufferSizeInPages) {
    console.log(oldScreenBufferSizeInPages, "->", screenBufferSizeInPages);
    memory.grow(screenBufferSizeInPages - oldScreenBufferSizeInPages);
  }
};

const wasm = await WebAssembly.instantiateStreaming(
  fetch("zig-out/lib/ZigWasmDemo.wasm"),
  {
    env: {
      __linear_memory: new WebAssembly.Memory({ initial: 0 }),
      __stack_pointer: new WebAssembly.Global({ value: "i32", mutable: true }),
      print: (/** @type {number} */ ptr) => {
        /** @type {WebAssembly.Memory} */
        const mem = wasm.instance.exports.memory;
        const arr = new Uint8Array(mem.buffer);
        let s = "";
        while (arr[ptr] !== 0) s += String.fromCharCode(arr[ptr++]);
        console.log(s);
      },
      alloc: (/** @type {number} */ bytes) => {
      },
    },
  },
);

wasm.instance.exports.memory.grow(screenBufferSizeInPages);
addEventListener("resize", resizeHandler(wasm.instance.exports.memory));
console.log(wasm.instance.exports.memory);

const loop = () => {
  /** @type {CallableFunction} */
  const allocScreen = wasm.instance.exports.allocScreen;
  /** @type {CallableFunction} */
  const freeScreen = wasm.instance.exports.freeScreen;
  /** @type {CallableFunction} */
  const render = wasm.instance.exports.render;
  /** @type {WebAssembly.Memory} */
  const mem = wasm.instance.exports.memory;

  const x = 10;
  const y = 10;
  const w = 100;
  const h = 100;

  console.time("allocScreen");
  const ptr = allocScreen(w, h);
  console.timeEnd("allocScreen");

  console.log(ptr);
  console.time("render");
  render(ptr, w, h);
  console.timeEnd("render");

  const arr = new Uint8ClampedArray(
    mem.buffer,
    ptr,
    w * h * 4,
  );
  const img = new ImageData(arr, w, h);

  ctx.fillStyle = "#0f0";
  ctx.fillRect(x - 1, y - 1, w + 2, h + 2);
  ctx.clearRect(x, y, w, h);
  ctx.putImageData(img, x, y);

  console.time("freeScreen");
  freeScreen(ptr);
  console.timeEnd("freeScreen");

  requestAnimationFrame(loop);
};
loop();
