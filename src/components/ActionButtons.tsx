import { For, createSignal } from "solid-js";
import { sudoku } from "../sudoku";
import clsx from "clsx";

const actions = [
  {
    name: "Set",
    color: "blue",
  },
  {
    name: "Mark",
    color: "purple",
  },
  {
    name: "Highlight",
    color: "red",
  },
] as const;
type Action = (typeof actions)[number];

function ActionButtons() {
  const context = sudoku.state.context;
  const [action, setAction] = createSignal<Action>(actions[0]);

  function handleAction(num: number) {
    console.log(action(), num);
    switch (action().name) {
      case "Highlight":
        if (context.highlight === num) {
          sudoku.send({ type: "HIGHLIGHT", digit: 0 });
        } else {
          sudoku.send({ type: "HIGHLIGHT", digit: num });
        }
        break;
      case "Mark":
        sudoku.send({ type: "TOGGLEMARK", cell: context.cursor, mark: num });
        break;
      case "Set":
        if (context.grid.cells[context.cursor].digit === num) {
          sudoku.send({ type: "SETCELL", cell: context.cursor, digit: 0 });
        } else {
          sudoku.send({ type: "SETCELL", cell: context.cursor, digit: num });
        }
        break;
    }
  }

  function showRing(num: number) {
    switch (action().name) {
      case "Highlight":
        return context.highlight === num;
      case "Mark":
        return (
          context.grid.cells[context.cursor].digit === 0 &&
          context.grid.cells[context.cursor].marks[num]
        );
      case "Set":
        return (
          !context.grid.prefilled.has(context.cursor) &&
          context.grid.cells[context.cursor].digit === num
        );
    }
  }

  function disabled() {
    switch (action().name) {
      case "Highlight":
        return false;
      case "Mark":
        return context.grid.cells[context.cursor].digit !== 0;
      case "Set":
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
                "flex flex-grow border-t border-b border-r border-gray-200 bg-white py-2 text-base font-medium text-gray-900 first:rounded-l-lg last:rounded-r-lg hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 dark:hover:text-white",
                showRing(num) && {
                  "z-10 ring-2 dark:text-white": true,
                  "border-blue-200 bg-blue-300 ring-blue-700 hover:bg-blue-100 dark:border-blue-600 dark:bg-blue-700 dark:text-blue-200 dark:ring-blue-500  dark:hover:bg-blue-600 dark:hover:text-blue-100":
                    action().color === "blue",
                  "border-red-200 bg-red-300 ring-red-700 hover:bg-red-100 dark:border-red-600 dark:bg-red-700 dark:text-red-200 dark:ring-red-500  dark:hover:bg-red-600 dark:hover:text-red-100":
                    action().color === "red",
                  "border-purple-200 bg-purple-300 ring-purple-700 hover:bg-purple-100 dark:border-purple-600 dark:bg-purple-700 dark:text-purple-200 dark:ring-purple-500  dark:hover:bg-purple-600 dark:hover:text-purple-100":
                    action().color === "purple",
                },
              )}
              onClick={() => handleAction(num)}
              disabled={disabled()}
            >
              <span class="mx-auto">{num}</span>
            </button>
          )}
        </For>
      </div>
      <div class="inline-flex w-full" role="group">
        <For each={actions}>
          {(act) => {
            console.log(act);
            return (
              <button
                type="button"
                class={clsx(
                  "flex flex-grow border-t border-b border-r py-2 text-base font-medium text-gray-900 first:rounded-l-lg last:rounded-r-lg",
                  action().name === act.name && {
                    "z-10 ring-2": true,
                    "ring-blue-700 dark:ring-blue-500": act.color === "blue",
                    "ring-red-700 dark:ring-red-500": act.color === "red",
                    "ring-purple-700 dark:ring-purple-500":
                      act.color === "purple",
                  },
                  {
                    "border-blue-200 bg-blue-300 ring-blue-700 hover:bg-blue-100 dark:border-blue-600 dark:bg-blue-700 dark:text-blue-200 dark:hover:bg-blue-600 dark:hover:text-blue-100":
                      act.color === "blue",
                    "border-red-200 bg-red-300 ring-red-700 hover:bg-red-100 dark:border-red-600 dark:bg-red-700 dark:text-red-200 dark:hover:bg-red-600 dark:hover:text-red-100":
                      act.color === "red",
                    "border-purple-200 bg-purple-300 ring-purple-700 hover:bg-purple-100 dark:border-purple-600 dark:bg-purple-700 dark:text-purple-200 dark:hover:bg-purple-600 dark:hover:text-purple-100":
                      act.color === "purple",
                  },
                )}
                onClick={() => setAction(act)}
              >
                <span class="mx-auto">{act.name}</span>
              </button>
            );
          }}
        </For>
      </div>
    </div>
  );
}

export default ActionButtons;
