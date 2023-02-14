import clsx from "clsx";
import { For, createSignal } from "solid-js";
import { sudoku } from "./sudoku";

const difficulties = [
  {
    name: "Beginner",
    value: 0,
  },
  {
    name: "Easy",
    value: 1,
  },
  {
    name: "Medium",
    value: 2,
  },
  {
    name: "Tricky",
    value: 3,
  },
  {
    name: "Hard",
    value: 4,
  },
];

export default function DifficultyButtons() {
  const context = sudoku.state.context;

  return (
    <div class="inline-flex select-none" role="group">
      <For each={difficulties}>
        {(difficulty) => (
          <button
            type="button"
            class={clsx(
              "border-t border-b border-r border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 first:rounded-l-lg last:rounded-r-lg hover:bg-gray-100 hover:text-blue-700 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 dark:hover:text-white",
              {
                "z-10 text-blue-700 ring-2 ring-blue-700 dark:text-white dark:ring-blue-500":
                  context.difficulty === difficulty.value,
              },
            )}
            onClick={() =>
              sudoku.send({ type: "RESETGAME", difficulty: difficulty.value })
            }
          >
            {difficulty.name}
          </button>
        )}
      </For>
    </div>
  );
}
