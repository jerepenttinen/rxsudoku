/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useEffect, useState } from "react";
import { cross } from "@/utilFuncs";
import { useBoardStore } from "@/boardStore";

function Clickable({number, setUserNumber}: {number: number, setUserNumber: (arg0: string) => void}) {
  const [show, setShow] = useState(false);

  const handleClick = () => setShow(show => !show);
  const handleDoubleClick = () => setUserNumber(number.toString());

  return (
    <div
      className={`${
        show ? "text-zinc-300" : "text-transparent hover:text-stone-400"
      } hover:bg-zinc-700 p-1`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      <span className="pointer-events-none select-none">{number}</span>
    </div>
  );
}

function Cell({cell}: {cell: string}) {
  const boardStore = useBoardStore();
  const [userNumber, setUserNumber] = useState("");
  useEffect(
    () => setUserNumber(boardStore.cells[cell].digit),
    [boardStore.cells[cell].digit]
  );
  return (
    <div className="h-10 w-10 lg:h-24 lg:w-24 flex justify-center items-center border-[1px] border-t-zinc-600 border-l-stone-600 border-b-transparent border-r-transparent">
      {userNumber !== "0" ? (
        <span className={`text-3xl lg:text-5xl ${boardStore.cells[cell].digit === userNumber ? "text-zinc-300" : "text-amber-700"}`}>
          {userNumber}
        </span>
      ) : (
        <div className="grid gap-0 grid-rows-3 grid-cols-3 p-1 w-full h-full text-center">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n, i) => (
            <Clickable key={i} number={n} setUserNumber={setUserNumber} />
          ))}
        </div>
      )}
    </div>
  );
}

function S({list}: {list: string[]}) {
  return (
    <div className="grid gap-0 grid-rows-3 grid-cols-3 border-[1px] border-zinc-600">
      {list.map((cell, i) => (
        <Cell key={i} cell={cell} />
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
  const b = [
    [4, 0, 3, 6, 5, 1, 0, 9, 0],
    [8, 0, 1, 0, 0, 9, 0, 0, 0],
    [9, 0, 0, 8, 0, 3, 0, 0, 0],
    [0, 0, 0, 0, 0, 6, 2, 0, 0],
    [0, 6, 5, 0, 0, 0, 0, 0, 3],
    [0, 0, 0, 3, 4, 0, 7, 1, 0],
    [5, 2, 0, 1, 0, 0, 0, 0, 0],
    [7, 9, 0, 0, 0, 0, 0, 0, 0],
    [0, 3, 0, 5, 0, 0, 6, 9, 4],
  ];
  useEffect(() => console.log(groups), []);
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