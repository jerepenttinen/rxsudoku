import { useBoardStore } from "./boardStore";
import Button from "./Button";
import { useCallback, useState } from "react";
import shallow from "zustand/shallow";

function NewGame() {
  const [generateGridCorrect, generateGridC] = useBoardStore(
    (state) => [state.generateGridSlow, state.generateGrid],
    shallow
  );

  const [wasm, setWasm] = useState(true);
  const generateGrid = useCallback(
    (num: number) => (wasm ? generateGridC(num) : generateGridCorrect(num)),
    [wasm]
  );

  return (
    <div className="my-3 flex select-none flex-row gap-3">
      <Button onClick={() => generateGrid(34)}>Easy</Button>
      <Button onClick={() => generateGrid(30)}>Medium</Button>
      <Button onClick={() => generateGrid(27)}>Hard</Button>
      <Button onClick={() => generateGrid(24)}>Very Hard</Button>
      <Button onClick={() => generateGrid(17)}>Evil</Button>
      <Button
        onClick={() => setWasm((wasm) => !wasm)}
        className={`w-16 ${
          wasm
            ? "bg-violet-500 hover:bg-violet-400 active:bg-violet-500 dark:bg-violet-600 dark:hover:bg-violet-500 dark:active:bg-violet-600"
            : "bg-blue-500 hover:bg-blue-400 active:bg-blue-500 dark:bg-blue-600 dark:hover:bg-blue-500 dark:active:bg-blue-600"
        }`}
      >
        {wasm ? "WASM" : "TS"}
      </Button>
    </div>
  );
}

export default NewGame;
