import { IoReload } from "solid-icons/io";
import { sudoku } from "../sudoku";
import { Button } from "solid-headless";

export default function ResetGameButton() {
  const { context } = sudoku.state;
  return (
    <Button
      class="inline-flex h-10 items-center rounded-lg bg-blue-700 px-4 py-2.5 text-center text-lg font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:dark:bg-gray-500"
      onClick={() => {
        sudoku.send({
          type: "RESETGAME",
          difficulty: context.difficulty,
        });
      }}
    >
      <IoReload />
    </Button>
  );
}
