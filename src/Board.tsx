/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useState } from "react";

function Clickable({number, setUserNumber}: {number: number, setUserNumber: (arg0: number) => void}) {
  const [show, setShow] = useState(false);

  const handleClick = () => setShow(show => !show);
  const handleDoubleClick = () => setUserNumber(number);

  return (
    <div
      className={`${
        show ? "text-stone-300" : "text-stone-800 hover:text-stone-400"
      } hover:bg-stone-700 p-1`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      <span className="pointer-events-none select-none">{number}</span>
    </div>
  );
}

function Cell({number}: {number: number}) {
  const [userNumber, setUserNumber] = useState(number);
  return (
    <div className="h-10 w-10 lg:h-24 lg:w-24 flex justify-center items-center border-[1px] border-t-stone-600 border-l-stone-600 border-b-transparent border-r-transparent">
      {userNumber !== 0 ? (
        <span className={`text-3xl lg:text-5xl ${number === userNumber ? "text-stone-300" : "text-amber-700"}`}>
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

function S({list}: {list: number[]}) {
  return (
    <div className="grid gap-0 grid-rows-3 grid-cols-3 border-[1px] border-stone-600">
      {list.map((n, i) => (
        <Cell key={i} number={n} />
      ))}
    </div>
  );
}

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
  return (
    <div className="border-2 border-stone-600 drop-shadow-2xl">
      <div className="grid gap-0 grid-rows-3 grid-cols-3 bg-stone-800">
        {b.map((s, i) => (
          <S key={i} list={s} />
        ))}
      </div>
    </div>
  );
}

export default Board;