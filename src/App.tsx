import { useEffect } from "react";
import Board from "@/Board";
import { useBoardStore } from "@/boardStore";

function App() {
  const boardStore = useBoardStore();
  useEffect(() => console.log(boardStore.cells), [boardStore.cells])
  return (
    <main className="flex flex-col items-center max-h-full min-h-screen bg-zinc-900">
      <div>
        <section className="flex flex-row">
          <input
            type="text"
            placeholder="grid"
            className="bg-zinc-800 text-zinc-200 border-2 appearance-none border-transparent p-2 my-4 mr-3 w-full"
            onChange={(evt) => boardStore.setNewGrid(evt.target.value)}
          ></input>
          <button
            onClick={boardStore.loadGrid}
            className="p-2 my-4 bg-zinc-800 hover:bg-zinc-700 border-2 border-transparent hover:border-amber-700 text-zinc-200 w-32"
          >
            Load
          </button>
        </section>
        <Board />
      </div>
    </main>
  );
}

export default App;
