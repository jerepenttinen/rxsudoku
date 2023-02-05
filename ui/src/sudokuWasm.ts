import MyWorker from "./sudokuWasmWorker?worker";

let worker: Worker;
if (window.Worker) {
  worker = new MyWorker();
}

async function generateGridSudokuGrid(prefillCount: number): Promise<string> {
  return new Promise<string>((resolve) => {
    worker.postMessage([prefillCount]);
    worker.onmessage = (e) => {
      console.log(e.data);
      resolve(e.data);
    };
  });
}

export default generateGridSudokuGrid;
