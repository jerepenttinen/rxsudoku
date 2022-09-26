import init from "./sudoku.wasm?init";

type SudokuInstance = {
  exports: {
    memory: WebAssembly.Memory;
    generateSudokuGrid: CallableFunction;
  };
};

let once = true;
let memory: WebAssembly.Memory;
let generateSudokuGrid: CallableFunction;

onmessage = async function (e) {
  if (once) {
    once = false;
    const { exports } = (await init({})) as SudokuInstance;
    memory = exports.memory;
    generateSudokuGrid = exports.generateSudokuGrid;
  }

  const gridBuf = new Uint8Array(memory.buffer, 0, 81);
  generateSudokuGrid(
    gridBuf.byteOffset,
    e.data[0],
    Math.floor(Date.now() / 1000)
  );
  postMessage(new TextDecoder("utf8").decode(gridBuf));
};
