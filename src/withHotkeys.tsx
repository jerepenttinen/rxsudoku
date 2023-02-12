import { createKeyHold, createShortcut, useKeyDownList } from "./keyboard";
import { sudoku } from "./sudoku";
import { Component, createEffect } from "solid-js";

export default function withHotkeys(wrapped: Component) {
  for (let i = 1; i <= 9; i++) {
    const key = "Digit" + i.toString();
    const toggleMark = () =>
      sudoku.send({
        type: "TOGGLEMARK",
        cell: sudoku.state.context.cursor,
        mark: i,
      });

    createShortcut(["ControlLeft", key], toggleMark);
    createShortcut(["ControlRight", key], toggleMark);

    const toggleHighlight = () => {
      if (sudoku.state.context.highlight === i) {
        sudoku.send({
          type: "HIGHLIGHT",
          digit: 0,
        });
      } else {
        sudoku.send({
          type: "HIGHLIGHT",
          digit: i,
        });
      }
    };

    createShortcut(["ShiftLeft", key], toggleHighlight);
    createShortcut(["ShiftRight", key], toggleHighlight);

    createShortcut([key], () =>
      sudoku.send({
        type: "SETCELL",
        cell: sudoku.state.context.cursor,
        digit: i,
      }),
    );
  }

  // TODO: add support for holding
  createShortcut(["ArrowUp"], () =>
    sudoku.send({ type: "MOVECURSOR", direction: "up" }),
  );
  createShortcut(["ControlLeft", "ArrowUp"], () =>
    sudoku.send({ type: "MOVECURSOR", direction: "up", subgrid: true }),
  );
  createShortcut(["ControlRight", "ArrowUp"], () =>
    sudoku.send({ type: "MOVECURSOR", direction: "up", subgrid: true }),
  );

  createShortcut(["ArrowDown"], () =>
    sudoku.send({ type: "MOVECURSOR", direction: "down" }),
  );
  createShortcut(["ControlLeft", "ArrowDown"], () =>
    sudoku.send({ type: "MOVECURSOR", direction: "down", subgrid: true }),
  );
  createShortcut(["ControlRight", "ArrowDown"], () =>
    sudoku.send({ type: "MOVECURSOR", direction: "down", subgrid: true }),
  );

  createShortcut(["ArrowLeft"], () =>
    sudoku.send({ type: "MOVECURSOR", direction: "left" }),
  );
  createShortcut(["ControlLeft", "ArrowLeft"], () =>
    sudoku.send({ type: "MOVECURSOR", direction: "left", subgrid: true }),
  );
  createShortcut(["ControlRight", "ArrowLeft"], () =>
    sudoku.send({ type: "MOVECURSOR", direction: "left", subgrid: true }),
  );

  createShortcut(["ArrowRight"], () =>
    sudoku.send({ type: "MOVECURSOR", direction: "right" }),
  );
  createShortcut(["ControlLeft", "ArrowRight"], () =>
    sudoku.send({ type: "MOVECURSOR", direction: "right", subgrid: true }),
  );
  createShortcut(["ControlRight", "ArrowRight"], () =>
    sudoku.send({ type: "MOVECURSOR", direction: "right", subgrid: true }),
  );

  createShortcut(["KeyU"], () => sudoku.send({ type: "UNDO" }));
  createShortcut(["KeyR"], () => sudoku.send({ type: "REDO" }));

  createShortcut(["KeyT"], () => {
    sudoku.send({
      type: "TOGGLEMARK",
      cell: sudoku.state.context.cursor,
      mark: sudoku.state.context.highlight,
    });
  });

  createShortcut(["KeyF"], () => {
    sudoku.send({
      type: "SETCELL",
      cell: sudoku.state.context.cursor,
      digit: sudoku.state.context.highlight,
    });
  });

  return wrapped;
}
