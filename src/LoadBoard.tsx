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
        className="my-4 mr-3 w-full appearance-none border-2 border-transparent bg-zinc-800 p-2 text-zinc-200"
        onChange={(evt) => setNewGrid(evt.target.value)}
      ></input>
      <button
        onClick={loadGrid}
        className="my-4 w-32 border-2 border-transparent bg-zinc-800 p-2 text-zinc-200 hover:border-blue-500 hover:bg-zinc-700"
      >
        Load
      </button>
    </section>
  );
}

export default LoadBoard;