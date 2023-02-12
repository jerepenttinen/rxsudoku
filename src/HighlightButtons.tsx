import { For } from "solid-js";
import { sudoku } from "./sudoku";
import clsx from "clsx";

function HighlightButtons() {
  const context = sudoku.state.context;
  return (
    <div class="my-4 inline-flex select-none" role="group">
      <For each={[1, 2, 3, 4, 5, 6, 7, 8, 9]}>
        {(num) => (
          <button
            type="button"
            class={clsx(
              "border-t border-b border-r border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 first:rounded-l-lg last:rounded-r-lg hover:bg-gray-100 hover:text-blue-700 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 dark:hover:text-white",
              {
                "z-10 text-blue-700 ring-2 ring-blue-700 dark:text-white dark:ring-blue-500":
                  context.highlight === num,
              },
            )}
            onClick={() => {
              if (context.highlight === num) {
                sudoku.send({ type: "HIGHLIGHT", digit: 0 });
              } else {
                sudoku.send({ type: "HIGHLIGHT", digit: num });
              }
            }}
          >
            {num}
          </button>
        )}
      </For>
    </div>
  );
}

export default HighlightButtons;
