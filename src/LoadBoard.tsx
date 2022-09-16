import { useBoardStore } from "./boardStore";
import shallow from "zustand/shallow";

function LoadBoard() {
  const [loadGrid, setNewGrid] = useBoardStore(
    (state) => [state.loadGrid, state.setNewGrid],
    shallow
  );
  return (
    <section className="flex flex-row">
      <input
        type="text"
        placeholder="grid"
        className="bg-zinc-800 text-zinc-200 border-2 appearance-none border-transparent p-2 my-4 mr-3 w-full"
        onChange={(evt) => setNewGrid(evt.target.value)}
      ></input>
      <button
        onClick={loadGrid}
        className="p-2 my-4 bg-zinc-800 hover:bg-zinc-700 border-2 border-transparent hover:border-blue-500 text-zinc-200 w-32"
      >
        Load
      </button>
    </section>
  );
}

export default LoadBoard;