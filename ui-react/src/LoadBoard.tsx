import { useRef, FormEvent } from "react";
import { useBoardStore } from "./boardStore";

function LoadBoard() {
  const loadGrid = useBoardStore((state) => state.loadGrid);
  const inputBox = useRef<HTMLInputElement>(null);

  const handleSubmit = (evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    if (inputBox.current !== null) {
      loadGrid(inputBox.current.value);
    }
  };

  return (
    <form className="flex w-[80vmin] flex-row" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="grid"
        className="my-4 mr-3 w-full appearance-none rounded-lg border-2 border-transparent bg-zinc-800 p-2 text-zinc-200 focus:border-blue-500 focus:bg-zinc-700 focus:outline-none"
        ref={inputBox}
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
