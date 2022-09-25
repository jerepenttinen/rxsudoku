import { useMemo } from "react";
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

async function generateGrid(prefillCount: number): Promise<string> {
  if (once) {
    once = false;
    const { exports } = (await init({})) as SudokuInstance;
    memory = exports.memory;
    generateSudokuGrid = exports.generateSudokuGrid;
  }

  return new Promise<string>((resolve) => {
    const gridBuf = new Uint8Array(memory.buffer, 0, 81);
    generateSudokuGrid(
      gridBuf.byteOffset,
      prefillCount,
      Math.floor(Date.now() / 1000)
    );
    resolve(new TextDecoder("utf8").decode(gridBuf));
  });
}

export default generateGrid;
