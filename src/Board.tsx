/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { cross } from "@/utilFuncs";
import { useBoardStore } from "@/boardStore";
import shallow from "zustand/shallow";

function Clickable({cell, number}: {cell: string, number: number}) {
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
      } hover:bg-zinc-700 p-1`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      <span className="pointer-events-none select-none">{number}</span>
    </div>
  );
}

function Cell({cell}: {cell: string}) {
  const digit = useBoardStore((state) => state.cells[cell].digit);
  return (
    <div className="h-10 w-10 lg:h-24 lg:w-24 flex justify-center items-center border-[1px] border-t-zinc-600 border-l-stone-600 border-b-transparent border-r-transparent">
      {digit !== "0" ? (
        <span className="text-3xl lg:text-5xl text-zinc-300">
          {digit}
        </span>
      ) : (
        <div className="grid gap-0 grid-rows-3 grid-cols-3 p-1 w-full h-full text-center">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n, i) => (
            <Clickable key={cell + "_" + i} cell={cell} number={n} />
          ))}
        </div>
      )}
    </div>
  );
}

function S({list}: {list: string[]}) {
  return (
    <div className="grid gap-0 grid-rows-3 grid-cols-3 border-[1px] border-zinc-600">
      {list.map((cell) => (
        <Cell key={cell} cell={cell} />
      ))}
    </div>
  );
}

const groups = [
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
    <div className="border-2 border-zinc-600 drop-shadow-2xl">
      <div className="grid gap-0 grid-rows-3 grid-cols-3 bg-zinc-800">
        {groups.map((s, i) => (
          <S key={i} list={s} />
        ))}
      </div>
    </div>
  );
}

export default Board;