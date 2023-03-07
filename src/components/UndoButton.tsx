import { sudoku } from "../sudoku";
import { IoArrowBack } from "solid-icons/io";

export default function UndoButton() {
  const { context } = sudoku.state;
  return (
    <button
      class="inline-flex items-center rounded-lg bg-blue-700 px-4 py-2.5 text-center text-lg font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:dark:bg-gray-500"
      type="button"
      onClick={() => sudoku.send({ type: "UNDO" })}
      disabled={context.past.length === 0}
    >
      <IoArrowBack />
    </button>
  );
}
