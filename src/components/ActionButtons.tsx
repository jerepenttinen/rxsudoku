import { For, createSignal } from "solid-js";
import { sudoku } from "../sudoku";
import clsx from "clsx";
import { RadioGroup, RadioGroupOption } from "solid-headless";
import { getDigit, isClue, isMarked } from "../generator/digit";

const actions = [
  {
    name: "Highlight",
    color: "blue",
  },
  {
    name: "Set",
    color: "red",
  },
  {
    name: "Mark",
    color: "purple",
  },
] as const;
type Action = (typeof actions)[number];

function ActionButtons() {
  const context = sudoku.state.context;
  const [action, setAction] = createSignal<Action>(actions[0]);

  function handleAction(num: number) {
    switch (action().name) {
      case "Highlight":
        if (context.highlight === num) {
          sudoku.send({ type: "HIGHLIGHT", digit: 0 });
        } else {
          sudoku.send({ type: "HIGHLIGHT", digit: num });
        }
        break;
      case "Mark":
        console.log("togglemark", context.cursor, num);
        sudoku.send({ type: "TOGGLEMARK", cell: context.cursor, mark: num });
        break;
      case "Set":
        if (getDigit(context.grid[context.cursor]) === num) {
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
          getDigit(context.grid[context.cursor]) === 0 &&
          isMarked(context.grid[context.cursor], num)
        );
      case "Set":
        return (
          !isClue(context.grid[context.cursor]) &&
          getDigit(context.grid[context.cursor]) === num
        );
    }
  }

  function disabled() {
    switch (action().name) {
      case "Highlight":
        return false;
      case "Mark":
        return getDigit(context.grid[context.cursor]) !== 0;
      case "Set":
        return isClue(context.grid[context.cursor]);
    }
  }

  return (
    <div class="flex w-full flex-col gap-4">
      <div class="grid select-none grid-cols-9" role="group">
        <For each={[1, 2, 3, 4, 5, 6, 7, 8, 9]}>
          {(num) => (
            <button
              type="button"
              class={clsx(
                "flex flex-grow border-t border-b border-r py-2 text-base font-medium first:rounded-l-lg last:rounded-r-lg",
                showRing(num)
                  ? {
                      "z-10 ring-2 dark:text-white": true,
                      "border-blue-200 bg-blue-300 ring-blue-700 hover:bg-blue-100 dark:border-blue-600 dark:bg-blue-700 dark:text-blue-200 dark:ring-blue-500  dark:hover:bg-blue-600 dark:hover:text-blue-100":
                        action().color === "blue",
                      "border-red-200 bg-red-300 ring-red-700 hover:bg-red-100 dark:border-red-600 dark:bg-red-700 dark:text-red-200 dark:ring-red-500  dark:hover:bg-red-600 dark:hover:text-red-100":
                        action().color === "red",
                      "border-purple-200 bg-purple-300 ring-purple-700 hover:bg-purple-100 dark:border-purple-600 dark:bg-purple-700 dark:text-purple-200 dark:ring-purple-500  dark:hover:bg-purple-600 dark:hover:text-purple-100":
                        action().color === "purple",
                    }
                  : "border-gray-200 bg-white text-gray-900 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 dark:hover:text-white",
              )}
              onClick={() => handleAction(num)}
              disabled={disabled()}
            >
              <span class="mx-auto">{num}</span>
            </button>
          )}
        </For>
      </div>
      <RadioGroup
        class="grid w-full grid-cols-3"
        value={action()}
        onChange={setAction}
      >
        <For each={actions}>
          {(act) => (
            <RadioGroupOption
              value={act}
              class={clsx(
                "flex select-none justify-center border-t border-b border-r py-2 text-base font-medium text-gray-900 first:rounded-l-lg last:rounded-r-lg",
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
            >
              {act.name}
            </RadioGroupOption>
          )}
        </For>
      </RadioGroup>
    </div>
  );
}

export default ActionButtons;
