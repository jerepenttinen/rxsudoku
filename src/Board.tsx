/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { cross } from "@/utilFuncs";
import { useBoardStore } from "@/boardStore";
import shallow from "zustand/shallow";

function Clickable({ cell, number }: { cell: string; number: number }) {
  const [toggleMark, setCellDigit, mark] = useBoardStore(
    (state) => [
      state.toggleMark,
      state.setCellDigit,
      state.cells[cell].marks[number],
    ],
    shallow
  );

  const handleClick = () => toggleMark(cell, number);
  const handleDoubleClick = () => setCellDigit(cell, number);

  return (
    <div
      className={`${
        mark
          ? "text-zinc-700 dark:text-zinc-300"
          : "text-transparent hover:text-stone-700/60 dark:hover:text-stone-300/60"
      } aspect-square h-full w-full hover:shadow-[inset_0em_0em_0em_10em_rgba(0,0,0,0.12)] dark:hover:shadow-[inset_0em_0em_0em_10em_rgba(1,1,1,0.12)]`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      <span className="pointer-events-none select-none align-top text-[min(1.8vh,1.8vw)]">
        {number}
      </span>
    </div>
  );
}

function Cell({ cell }: { cell: string }) {
  const [digit, prefilled, isCurrent, setCurrentCell, highlighted] =
    useBoardStore(
      (state) => [
        state.cells[cell].digit,
        state.cells[cell].prefilled,
        state.cells[cell].isCurrent,
        state.setCurrentCell,
        state.cells[cell].highlighted,
      ],
      shallow
    );

  return (
    <div
      onClick={() => setCurrentCell(cell)}
      className={`${
        isCurrent && "z-10 ring-2 ring-inset ring-blue-500"
      }  flex aspect-square items-center justify-center outline outline-1 outline-zinc-900 dark:outline-zinc-600`}
    >
      {digit !== "0" ? (
        <span
          className={`pointer-events-none select-none ${
            prefilled ? "text-zinc-900 dark:text-zinc-300" : "text-blue-500"
          } text-[min(5.5vh,5.5vw)]`}
        >
          {digit}
        </span>
      ) : (
        <div
          className={`grid aspect-square h-full w-full grid-cols-3 grid-rows-3 gap-0 p-1 ${
            highlighted && "bg-blue-300/80 dark:bg-blue-900/30"
          }
          ${isCurrent && "z-10 ring-2 ring-inset ring-blue-500"}
          `}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n, i) => (
            <Clickable key={`${cell}_${i}`} cell={cell} number={n} />
          ))}
        </div>
      )}
    </div>
  );
}

function SubGrid({ list }: { list: string[] }) {
  return (
    <div className="grid grid-cols-3 grid-rows-3 gap-[1px] border-2 border-zinc-900 dark:border-zinc-600">
      {list.map((cell) => (
        <Cell key={cell} cell={cell} />
      ))}
    </div>
  );
}

const subGrids = [
  ["A", "B", "C"],
  ["D", "E", "F"],
  ["G", "H", "I"],
].flatMap((g) =>
  [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
  ].map((i) => cross(g, i))
);

function Board() {
  return (
    <div className="aspect-square bg-zinc-50 drop-shadow-2xl dark:bg-zinc-800">
      <div className="grid h-[80vmin] w-[80vmin] grid-cols-3 grid-rows-3 text-center">
        {subGrids.map((s, i) => (
          <SubGrid key={"S" + i} list={s} />
        ))}
      </div>
    </div>
  );
}

export default Board;
