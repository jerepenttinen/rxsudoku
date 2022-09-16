import { useBoardStore } from "./boardStore";
import shallow from "zustand/shallow";
import * as React from "react";

function LoadBoard() {
  const [loadGrid, setNewGrid] = useBoardStore(
    (state) => [state.loadGrid, state.setNewGrid],
    shallow
  );

  const handleSubmit = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    loadGrid();
  };

  return (
    <form className="flex flex-row" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="grid"
        className="my-4 mr-3 w-full appearance-none rounded-lg border-2 border-transparent bg-zinc-800 p-2 text-zinc-200 focus:border-blue-500 focus:bg-zinc-700 focus:outline-none"
        onChange={(evt) => setNewGrid(evt.target.value)}
      ></input>
      <button
        type="submit"
        className="my-4 w-32 rounded-lg border-2 border-transparent bg-zinc-800 p-2 text-zinc-200 hover:border-blue-500 hover:bg-zinc-700 active:bg-zinc-800"
      >
        Load
      </button>
    </form>
  );
}

export default LoadBoard;
