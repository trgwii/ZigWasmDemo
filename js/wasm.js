//@ts-check
const wasm = await WebAssembly.instantiateStreaming(
  fetch("zig-out/lib/ZigWasmDemo.wasm"),
  {
    env: {
      __linear_memory: new WebAssembly.Memory({ initial: 0 }),
      __stack_pointer: new WebAssembly.Global({ value: "i32", mutable: true }),
      print: (/** @type {number} */ ptr) => {
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
/** @type {(width: number, height: number, screen?: number) => number} */
export const resizeScreen = (w, h, s = 0) =>
  //@ts-ignore
  wasm.instance.exports.resizeScreen(w, h, s);

/** @type {(game: number, screen: number, width: number, height: number) => void} */
//@ts-ignore
export const render = wasm.instance.exports.render;
/** @type {WebAssembly.Memory} */
//@ts-ignore
export const mem = wasm.instance.exports.memory;

/** @typedef {'Up' | 'Down' | 'Left' | 'Right'} Keys */

/** @type {(keys: Keys, down: boolean, handle?: number) => number} */
export const setKeys = (key, down, handle = 0) => {
  const keyIndex = key === "Up"
    ? 0
    : key === "Left"
    ? 1
    : key === "Down"
    ? 2
    : key === "Right"
    ? 3
    : -1;
  if (keyIndex === -1) return 0;
  //@ts-ignore
  return wasm.instance.exports.setKeys(keyIndex, down, handle);
};

/** @type {(game: number, keys: number, width: number, height: number) => number} */
//@ts-ignore
export const update = wasm.instance.exports.update;
