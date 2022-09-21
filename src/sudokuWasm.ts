import init from "./sudoku.wasm?init";

type SudokuInstance = {
  exports: {
    memory: WebAssembly.Memory;
    generateSudokuGrid: CallableFunction;
  };
};

const {
  exports: { memory, generateSudokuGrid },
} = (await init({})) as SudokuInstance;

function generateGrid(prefillCount: number): Promise<string> {
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
