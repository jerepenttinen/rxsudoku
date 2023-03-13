import { For } from "solid-js";
import { sudoku } from "../sudoku";
import {
  Menu,
  MenuItem,
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from "solid-headless";

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

export default function DifficultyDropdown() {
  const context = sudoku.state.context;

  return (
    <Popover defaultOpen={false} class="relative z-10">
      {({ isOpen, setState }) => (
        <>
          <PopoverButton class="inline-flex h-10 w-full items-center justify-center rounded-lg bg-blue-700 px-4 py-2.5 text-sm text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 md:w-24">
            {difficulties[context.difficulty].name}
          </PopoverButton>
          <Transition
            show={isOpen()}
            enter="transition duration-200"
            enterFrom="opacity-0 -translate-y-1 scale-50"
            enterTo="opacity-100 translate-y-0 scale-100"
            leave="transition duration-150"
            leaveFrom="opacity-100 translate-y-0 scale-100"
            leaveTo="opacity-0 -translate-y-1 scale-50"
          >
            <PopoverPanel
              unmount={false}
              class={`absolute right-0 z-10 mt-3 w-48 divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white shadow dark:divide-gray-600 dark:border-gray-600 dark:bg-gray-700`}
            >
              <Menu
                as="ul"
                class="space-y-1 p-3 text-sm text-gray-700 dark:text-gray-200"
              >
                <For each={difficulties}>
                  {(difficulty) => (
                    <MenuItem
                      as="li"
                      class="flex items-center rounded hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      <input
                        onChange={() => {
                          sudoku.send({
                            type: "RESETGAME",
                            difficulty: difficulty.value,
                          });
                          setState(false);
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
                    </MenuItem>
                  )}
                </For>
              </Menu>
            </PopoverPanel>
          </Transition>
        </>
      )}
    </Popover>
  );
}
