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
        mark ? "text-zinc-300" : "text-transparent hover:text-stone-400"
      } aspect-square h-full w-full hover:bg-zinc-700`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      <span className="pointer-events-none select-none align-top text-[1.8dvh]">
        {number}
      </span>
    </div>
  );
}

function Cell({ cell }: { cell: string }) {
  const [digit, prefilled, highlighted, setHighlightedCell] = useBoardStore(
    (state) => [
      state.cells[cell].digit,
      state.cells[cell].prefilled,
      state.cells[cell].highlighted,
      state.setHighlightedCell,
    ],
    shallow
  );

  return (
    <div
      onClick={() => setHighlightedCell(cell)}
      className={`${
        highlighted && "ring-4 ring-inset ring-purple-500"
      } flex aspect-square items-center justify-center border-[1px] border-t-zinc-600 border-l-stone-600 border-b-transparent border-r-transparent`}
    >
      {digit !== "0" ? (
        <span
          className={`pointer-events-none select-none ${
            prefilled ? "text-zinc-300" : "text-blue-500"
          } text-[6dvh]`}
        >
          {digit}
        </span>
      ) : (
        <div className="grid aspect-square h-full w-full grid-cols-3 grid-rows-3 gap-0 p-1">
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
    <div className="grid grid-cols-3 grid-rows-3 gap-0 border-[1px] border-zinc-600">
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
    <div className="aspect-square border-2 border-zinc-600 drop-shadow-2xl">
      <div className="grid h-[80vh] grid-cols-3 grid-rows-3 gap-0 bg-zinc-800 text-center">
        {subGrids.map((s, i) => (
          <SubGrid key={"S" + i} list={s} />
        ))}
      </div>
    </div>
  );
}

export default Board;
