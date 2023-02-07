import { describe, expect, it } from "vitest";
import { sudokuMachine } from "./sudokuMachine";
import { interpret } from "xstate";
import { initializeGrid } from "../generator/sudoku";

describe("grid generation", () => {
  it("should generate new grid when starting game", () => {
    let gridGenerated = false;

    const mockSudokuMachine = sudokuMachine.withConfig({
      actions: {
        generateGrid: () => {
          gridGenerated = true;
        },
      },
    });

    const mock = interpret(mockSudokuMachine).onTransition((state) => {
      if (state.matches("playing")) {
        expect(gridGenerated).toBeTruthy();
      }
    });

    mock.start();

    mock.send({ type: "STARTGAME" });
  });
});

describe("cursor movement", () => {
  it("should set cursor correctly", () => {
    let current = 0;
    const inputs = [
      {
        input: "D4",
        expected: "D4",
      },
      {
        input: "B2",
        expected: "B2",
      },
      {
        input: "X9",
        expected: "B2",
      },
      {
        input: "invalid",
        expected: "B2",
      },
    ];

    const mockSudokuMachine = sudokuMachine.withConfig({
      actions: {
        generateGrid: () => {},
      },
    });

    const mock = interpret(mockSudokuMachine).onTransition((state) => {
      if (state.event.type === "SETCURSOR" && current < inputs.length) {
        expect(state.context.cursor).toBe(inputs[current].expected);
        current++;
      }
    });

    mock.start();

    mock.send({ type: "STARTGAME" });

    for (const input of inputs) {
      mock.send({ type: "SETCURSOR", cell: input.input });
    }

    mock.stop();
  });
});

describe("setting cells", () => {
  it("should toggle mark", () => {
    let current = 0;
    const expected = [true, false, true, false];
    const mark = 1;
    const cellPos = "A1";

    const mockSudokuMachine = sudokuMachine.withConfig({
      actions: {
        generateGrid: () => {},
      },
    });

    const mock = interpret(mockSudokuMachine).onTransition((state) => {
      if (state.event.type === "TOGGLEMARK" && current < expected.length) {
        const input = expected[current];
        const cell = state.context.grid.cells[cellPos];
        expect(cell.marks[mark]).toBe(input);
        current++;
      }
    });

    mock.start();
    mock.send({ type: "STARTGAME" });

    for (const _ of expected) {
      mock.send({ type: "TOGGLEMARK", cell: cellPos, mark: mark });
    }
  });

  it("should not allow to toggle with peer that has marked digit", () => {
    const cellPos = "A1";
    const peerPos = "B2";
    const mark = 1;
    const mockSudokuMachine = sudokuMachine.withConfig({
      actions: {
        generateGrid: () => {},
      },
    });

    const mock = interpret(mockSudokuMachine).onTransition((state) => {
      if (state.event.type === "TOGGLEMARK") {
        const cell = state.context.grid.cells[cellPos];
        expect(cell.marks[mark]).toBe(false);
      }
    });

    mock.start();
    mock.send({ type: "STARTGAME" });

    mock.send({ type: "SETCELL", cell: peerPos, digit: mark });
    mock.send({ type: "TOGGLEMARK", cell: cellPos, mark: mark });
  });

  it("should eliminate peer marks", () => {
    const mockSudokuMachine = sudokuMachine.withConfig({
      actions: {
        generateGrid: (context) => {
          context.grid.cells.A1.marks[1] = true;
          context.grid.cells.A1.marks[2] = true;
          context.grid.cells.C1.marks[1] = true;
          return context.grid;
        },
      },
    });

    const mock = interpret(mockSudokuMachine).onTransition((state) => {
      if (state.event.type === "SETCELL") {
        expect(state.context.grid.cells.B1.digit).toBe(1);
        expect(state.context.grid.cells.A1.marks[1]).toBeFalsy();
        expect(state.context.grid.cells.A1.marks[2]).toBeTruthy();
        expect(state.context.grid.cells.C1.marks[1]).toBeFalsy();
      }
    });

    mock.start();
    mock.send({ type: "STARTGAME" });
    mock.send({ type: "SETCELL", cell: "B1", digit: 1 });
  });
});

describe("unde redo", () => {
  it("should be able to undo setting cell and then redo", () => {
    const mockSudokuMachine = sudokuMachine.withConfig({
      actions: {
        generateGrid: () => {},
      },
    });

    const mock = interpret(mockSudokuMachine).onTransition((state) => {
      if (state.event.type === "SETCELL") {
        expect(state.context.grid.cells.A1.digit).toBe(1);
      } else if (state.event.type === "UNDO") {
        expect(state.context.grid.cells.A1.digit).toBe(0);
      } else if (state.event.type === "REDO") {
        expect(state.context.grid.cells.A1.digit).toBe(1);
      }
    });

    mock.start();
    mock.send({ type: "STARTGAME" });
    mock.send({ type: "SETCELL", cell: "A1", digit: 1 });
    mock.send({ type: "UNDO" });
    mock.send({ type: "REDO" });
  });
});
