import { createShortcut } from "@solid-primitives/keyboard";
import { sudoku } from "./sudoku";
import { Component } from "solid-js";

export default function withHotkeys(wrapped: Component) {
  for (let i = 1; i <= 9; i++) {
    createShortcut(["Control", i.toString()], () =>
      sudoku.send({
        type: "TOGGLEMARK",
        cell: sudoku.state.context.cursor,
        mark: i,
      }),
    );

    // TODO: doesn't work, due to the fact that pressed button might be the special character behind number
    createShortcut(["Shift", i.toString()], () => {
      sudoku.send({
        type: "HIGHLIGHT",
        digit: i,
      });
    });

    createShortcut([i.toString()], () =>
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
  createShortcut(["Control", "ArrowUp"], () =>
    sudoku.send({ type: "MOVECURSOR", direction: "up", subgrid: true }),
  );

  createShortcut(["ArrowDown"], () =>
    sudoku.send({ type: "MOVECURSOR", direction: "down" }),
  );
  createShortcut(["Control", "ArrowDown"], () =>
    sudoku.send({ type: "MOVECURSOR", direction: "down", subgrid: true }),
  );

  createShortcut(["ArrowLeft"], () =>
    sudoku.send({ type: "MOVECURSOR", direction: "left" }),
  );
  createShortcut(["Control", "ArrowLeft"], () =>
    sudoku.send({ type: "MOVECURSOR", direction: "left", subgrid: true }),
  );

  createShortcut(["ArrowRight"], () =>
    sudoku.send({ type: "MOVECURSOR", direction: "right" }),
  );
  createShortcut(["Control", "ArrowRight"], () =>
    sudoku.send({ type: "MOVECURSOR", direction: "right", subgrid: true }),
  );

  createShortcut(["U"], () => sudoku.send({ type: "UNDO" }));
  createShortcut(["R"], () => sudoku.send({ type: "REDO" }));

  createShortcut(["T"], () => {
    sudoku.send({
      type: "TOGGLEMARK",
      cell: sudoku.state.context.cursor,
      mark: sudoku.state.context.highlight,
    });
  });

  createShortcut(["F"], () => {
    sudoku.send({
      type: "SETCELL",
      cell: sudoku.state.context.cursor,
      digit: sudoku.state.context.highlight,
    });
  });

  return wrapped;
}
