import { For, createSignal } from "solid-js";
import { sudoku } from "../sudoku";
import clsx from "clsx";

const actions = ["HIGHLIGHT", "SETCELL", "TOGGLEMARK"] as const;
type Actions = (typeof actions)[number];

function ActionButtons() {
  const context = sudoku.state.context;
  const [action, setAction] = createSignal<Actions>("HIGHLIGHT");

  function handleAction(num: number) {
    console.log(action(), num);
    switch (action()) {
      case "HIGHLIGHT":
        if (context.highlight === num) {
          sudoku.send({ type: "HIGHLIGHT", digit: 0 });
        } else {
          sudoku.send({ type: "HIGHLIGHT", digit: num });
        }
        break;
      case "TOGGLEMARK":
        sudoku.send({ type: "TOGGLEMARK", cell: context.cursor, mark: num });
        break;
      case "SETCELL":
        if (context.grid.cells[context.cursor].digit === num) {
          sudoku.send({ type: "SETCELL", cell: context.cursor, digit: 0 });
        } else {
          sudoku.send({ type: "SETCELL", cell: context.cursor, digit: num });
        }
        break;
    }
  }

  function showRing(num: number) {
    switch (action()) {
      case "HIGHLIGHT":
        return context.highlight === num;
      case "TOGGLEMARK":
        return (
          context.grid.cells[context.cursor].digit === 0 &&
          context.grid.cells[context.cursor].marks[num]
        );
      case "SETCELL":
        return (
          !context.grid.prefilled.has(context.cursor) &&
          context.grid.cells[context.cursor].digit === num
        );
    }
  }

  function disabledButton(num: number) {
    switch (action()) {
      case "HIGHLIGHT":
        return false;
      case "TOGGLEMARK":
        return context.grid.cells[context.cursor].digit !== 0;
      case "SETCELL":
        return context.grid.prefilled.has(context.cursor);
    }
  }

  return (
    <div class="flex w-full flex-col gap-4">
      <div class="inline-flex w-full select-none" role="group">
        <For each={[1, 2, 3, 4, 5, 6, 7, 8, 9]}>
          {(num) => (
            <button
              type="button"
              class={clsx(
                "flex flex-grow border-t border-b border-r border-gray-200 bg-white py-2 text-center text-base font-medium text-gray-900 first:rounded-l-lg last:rounded-r-lg hover:bg-gray-100 hover:text-blue-700 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 dark:hover:text-white",
                {
                  "z-10 text-blue-700 ring-2 ring-blue-700 dark:text-white dark:ring-blue-500":
                    showRing(num),
                },
              )}
              onClick={() => handleAction(num)}
              disabled={disabledButton(num)}
            >
              <span class="mx-auto">{num}</span>
            </button>
          )}
        </For>
      </div>
      <div class="inline-flex w-full" role="group">
        <For each={actions}>
          {(act) => (
            <button
              type="button"
              class={clsx(
                "flex flex-grow border-t border-b border-r border-gray-200 bg-white py-2 text-center text-base font-medium text-gray-900 first:rounded-l-lg last:rounded-r-lg hover:bg-gray-100 hover:text-blue-700 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 dark:hover:text-white",
                {
                  "z-10 text-blue-700 ring-2 ring-blue-700 dark:text-white dark:ring-blue-500":
                    action() === act,
                },
              )}
              onClick={() => setAction(act)}
            >
              <span class="mx-auto">{act}</span>
            </button>
          )}
        </For>
      </div>
    </div>
  );
}

export default ActionButtons;
