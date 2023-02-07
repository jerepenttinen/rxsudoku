import { For } from "solid-js";
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
              "text-zinc-700 dark:text-zinc-300": !highlighted(),
            }
          : {
              "hover:text-blue-800/60 dark:hover:text-blue-200/60":
                highlighted(),
              "hover:text-zinc-700/60 dark:hover:text-zinc-300/60":
                !highlighted(),
            },
      )}
      onClick={handleClick}
      onDblClick={handleDoubleClick}
    >
      <span class={"pointer-events-none select-none align-top text-[1.8vmin]"}>
        {number}
      </span>
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
        "flex items-center justify-center outline outline-1 outline-zinc-900 dark:outline-zinc-600",
        {
          "z-10 ring-2 ring-inset ring-blue-500": isCurrent(),
        },
      )}
    >
      {digit() !== 0 ? (
        <span
          class={clsx(
            "animate-appear pointer-events-none select-none text-[5.5vmin] motion-reduce:animate-none",
            {
              "text-zinc-900 dark:text-zinc-300": prefilled(),
              "text-blue-500": !prefilled(),
            },
          )}
        >
          {digit}
        </span>
      ) : (
        <div
          class={clsx(
            "grid h-full w-full grid-cols-3 grid-rows-3 p-1 transition-colors ease-in-out motion-reduce:transition-none",
            {
              "bg-blue-300/50 dark:bg-blue-900/30": highlighted(),
            },
          )}
        >
          <For each={[1, 2, 3, 4, 5, 6, 7, 8, 9]}>
            {(n) => <Mark cell={cell} number={n} />}
          </For>
        </div>
      )}
    </div>
  );
}

function Block({ list }: { list: string[] }) {
  return (
    <div class="grid grid-cols-3 grid-rows-3 gap-[1px] border-2 border-zinc-900 dark:border-zinc-600">
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
    <div class="grid h-[80vmin] w-[80vmin] grid-cols-3 grid-rows-3 bg-zinc-50 text-center drop-shadow-2xl dark:bg-zinc-800">
      <For each={blocks}>{(block, i) => <Block list={block} />}</For>
    </div>
  );
}

export default Board;
