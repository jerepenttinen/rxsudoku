import { For } from "solid-js";
import { sudoku } from "./sudoku";

function HighlightButtons() {
  const context = sudoku.state.context;
  return (
    <div class="my-4 flex select-none flex-row">
      <For each={[1, 2, 3, 4, 5, 6, 7, 8, 9]}>
        {(num) => (
          <button
            class={`rounded-none p-1 ${
              num === context.highlight &&
              "bg-blue-500 hover:bg-blue-400 active:bg-blue-500 dark:bg-blue-500 dark:text-zinc-900 dark:hover:bg-blue-400 dark:active:bg-blue-500"
            }`}
            onClick={() => sudoku.send({ type: "HIGHLIGHT", digit: num })}
          >
            {num}
          </button>
        )}
      </For>
    </div>
  );
}

export default HighlightButtons;
