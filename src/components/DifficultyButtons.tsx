import clsx from "clsx";
import { For, createSignal } from "solid-js";
import { sudoku } from "../sudoku";

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
  const [show, setShow] = createSignal(false);

  return (
    <div class="relative">
      <button
        class="inline-flex items-center rounded-lg bg-blue-700 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        type="button"
        onClick={() => setShow((show) => !show)}
      >
        GEAR ICON
      </button>
      <div
        class={`${
          show() ? "" : "hidden"
        } fixed top-0 left-0 z-10 h-screen w-screen bg-black opacity-20`}
        onClick={() => setShow(false)}
      ></div>
      <div
        class={`z-10 ${
          show() ? "" : "hidden"
        } absolute w-48 divide-y divide-gray-100 rounded-lg bg-white shadow dark:divide-gray-600 dark:bg-gray-700`}
      >
        <ul class="space-y-1 p-3 text-sm text-gray-700 dark:text-gray-200">
          <li>
            <div class="flex rounded hover:bg-gray-100 dark:hover:bg-gray-600">
              <button
                type="button"
                class="w-full select-none rounded p-1.5 text-sm font-medium text-gray-900 dark:text-gray-300"
                onClick={() => {
                  sudoku.send({
                    type: "RESETGAME",
                    difficulty: context.difficulty,
                  });
                  setShow(false);
                }}
              >
                Reset
              </button>
            </div>
          </li>
          <For each={difficulties}>
            {(difficulty) => (
              <li>
                <div class="flex items-center rounded hover:bg-gray-100 dark:hover:bg-gray-600">
                  <input
                    onChange={() => {
                      sudoku.send({
                        type: "RESETGAME",
                        difficulty: difficulty.value,
                      });
                      setShow(false);
                    }}
                    id={difficulty.name}
                    checked={context.difficulty === difficulty.value}
                    type="radio"
                    class="ml-2 h-4 w-4 border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-500 dark:bg-gray-600 dark:ring-offset-gray-700 dark:focus:ring-blue-600 dark:focus:ring-offset-gray-700"
                  />
                  <label
                    for={difficulty.name}
                    class="ml-2 w-full select-none rounded py-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                  >
                    {difficulty.name}
                  </label>
                </div>
              </li>
            )}
          </For>
        </ul>
      </div>
    </div>
  );

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
