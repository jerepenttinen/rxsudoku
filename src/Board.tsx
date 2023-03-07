import { For, Show } from "solid-js";
import { sudoku } from "./sudoku";
import clsx from "clsx";

function Mark({ cell, number }: { cell: string; number: number }) {
  const { context } = sudoku.state;

  const showMark = () => context.grid.cells[cell].marks[number];

  const handleClick = () =>
    sudoku.send({ type: "TOGGLEMARK", cell, mark: number });

  const handleDoubleClick = () =>
    sudoku.send({ type: "SETCELL", cell, digit: number });

  const highlighted = () =>
    context.grid.cells[cell].marks[context.highlight] ?? false;

  return (
    <div class="relative">
      <div class="absolute z-10 h-full w-full md:hidden"></div>
      <div
        class={clsx(
          "h-full w-full transition-all ease-in-out motion-reduce:transition-none dark:hover:shadow-[inset_0em_0em_0em_10em_rgba(1,1,1,0.12)]",
          {
            "hover:shadow-[inset_0em_0em_0em_5em_rgba(29,78,216,0.15)]":
              highlighted(),
            "hover:shadow-[inset_0em_0em_0em_5em_rgba(0,0,0,0.12)]":
              !highlighted(),
            "text-transparent": !showMark(),
          },
          showMark()
            ? {
                "text-blue-800 dark:text-blue-200": highlighted(),
                "text-gray-700 dark:text-gray-300": !highlighted(),
              }
            : {
                "hover:text-blue-800/60 dark:hover:text-blue-200/60":
                  highlighted(),
                "hover:text-gray-700/60 dark:hover:text-gray-300/60":
                  !highlighted(),
              },
        )}
        onClick={handleClick}
        onDblClick={handleDoubleClick}
      >
        <span
          class={
            "pointer-events-none select-none align-top text-[1.8vw] md:text-lg"
          }
        >
          {number}
        </span>
      </div>
    </div>
  );
}

function Cell({ cell }: { cell: string }) {
  const { context } = sudoku.state;
  const handleSetCursor = () => sudoku.send({ type: "SETCURSOR", cell });

  const isCurrent = () => context.cursor === cell;

  const digit = () => context.grid.cells[cell].digit;
  const prefilled = () => context.grid.prefilled.has(cell);
  const highlighted = () =>
    context.grid.cells[cell].marks[context.highlight] ?? false;

  return (
    <div
      onClick={handleSetCursor}
      class={clsx(
        "flex items-center justify-center outline outline-1 outline-zinc-900 dark:outline-gray-500",
        {
          "z-10 ring-2 ring-inset ring-blue-500": isCurrent(),
        },
      )}
    >
      <Show
        when={digit() !== 0}
        fallback={
          <div
            class={clsx(
              "grid h-full w-full grid-cols-3 grid-rows-3 p-1 transition-colors ease-in-out motion-reduce:transition-none",
              {
                "bg-blue-300/50 dark:bg-blue-900/40": highlighted(),
              },
            )}
          >
            <For each={[1, 2, 3, 4, 5, 6, 7, 8, 9]}>
              {(n) => <Mark cell={cell} number={n} />}
            </For>
          </div>
        }
      >
        <span
          class={clsx(
            "animate-appear pointer-events-none select-none text-[5.5vw] motion-reduce:animate-none md:text-5xl",
            {
              "text-zinc-900 dark:text-white": prefilled(),
              "text-blue-500 dark:text-blue-400": !prefilled(),
            },
          )}
        >
          {digit}
        </span>
      </Show>
    </div>
  );
}

function Block({ list }: { list: string[] }) {
  return (
    <div class="grid grid-cols-3 grid-rows-3 gap-[1px] border-2 border-zinc-900 dark:border-gray-500">
      <For each={list}>{(cell) => <Cell cell={cell} />}</For>
    </div>
  );
}

function cross(A: string[], B: string[]): string[] {
  const b = B;
  return A.flatMap((a1) => b.map((b1) => a1 + b1));
}

const blocks = [
  ["A", "B", "C"],
  ["D", "E", "F"],
  ["G", "H", "I"],
].flatMap((g) =>
  [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
  ].map((i) => cross(g, i)),
);

function Board() {
  return (
    <div class="grid aspect-square w-full grid-cols-3 grid-rows-3 bg-zinc-50 text-center drop-shadow-2xl dark:bg-gray-700 md:max-w-screen-md">
      <For each={blocks}>{(block, i) => <Block list={block} />}</For>
    </div>
  );
}

export default Board;
