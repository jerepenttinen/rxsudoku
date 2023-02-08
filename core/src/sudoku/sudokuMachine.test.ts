import { beforeEach, describe, expect, it } from "vitest";
import { interpret } from "xstate";
import { sudokuMachine } from "./sudokuMachine";
import { initializeGrid } from "../generator/sudoku";

let mockMachine = sudokuMachine;

beforeEach(() => {
  mockMachine = mockMachine.withConfig(
    {
      actions: {
        generateGrid: () => {},
      },
    },
    {
      grid: initializeGrid(),
      cursor: "A1",
      timePassed: 0,
      difficulty: 30,
      highlight: 0,
      past: [],
      future: [],
    }
  );
});

describe("grid generation", () => {
  it("should generate new grid when starting game", () => {
    let gridGenerated = false;

    const mockSudokuMachine = mockMachine.withConfig({
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

    const mock = interpret(mockMachine).onTransition((state) => {
      if (state.event.type === "SETCURSOR" && current < inputs.length) {
        expect(state.context.cursor).toBe(inputs[current].expected);
        current++;
      }
    });

    mock.start();

    for (const input of inputs) {
      mock.send({ type: "SETCURSOR", cell: input.input });
    }

    mock.stop();
  });
});

describe("setting cells", () => {
  it("should eliminate peer marks", () => {
    const mockSudokuMachine = mockMachine.withConfig({
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
    mock.send({ type: "SETCELL", cell: "B1", digit: 1 });
  });

  it("should toggle mark", () => {
    let current = 0;
    const expected = [true, false, true, false];
    const mark = 1;
    const cellPos = "A1";

    const mock = interpret(mockMachine).onTransition((state) => {
      if (state.event.type === "TOGGLEMARK" && current < expected.length) {
        const input = expected[current];
        const cell = state.context.grid.cells[cellPos];
        expect(cell.marks[mark]).toBe(input);
        current++;
      }
    });

    mock.start();

    for (const _ of expected) {
      mock.send({ type: "TOGGLEMARK", cell: cellPos, mark: mark });
    }
  });

  it("should not allow to toggle with peer that has marked digit", () => {
    const cellPos = "A1";
    const peerPos = "B2";
    const mark = 1;

    const mock = interpret(mockMachine).onTransition((state) => {
      if (state.event.type === "TOGGLEMARK") {
        const cell = state.context.grid.cells[cellPos];
        expect(cell.marks[mark]).toBe(false);
      }
    });

    mock.start();

    mock.send({ type: "SETCELL", cell: peerPos, digit: mark });
    mock.send({ type: "TOGGLEMARK", cell: cellPos, mark: mark });
  });
});

describe("unde redo", () => {
  it("should be able to undo setting cell and then redo", () => {
    const mock = interpret(mockMachine).onTransition((state) => {
      if (state.event.type === "SETCELL") {
        expect(state.context.grid.cells.A1.digit).toBe(1);
      } else if (state.event.type === "UNDO") {
        expect(state.context.grid.cells.A1.digit).toBe(0);
      } else if (state.event.type === "REDO") {
        expect(state.context.grid.cells.A1.digit).toBe(1);
      }
    });

    mock.start();
    mock.send({ type: "SETCELL", cell: "A1", digit: 1 });
    mock.send({ type: "UNDO" });
    mock.send({ type: "REDO" });
  });
});

describe("highlighting", () => {
  it("should highlight cells with corresponding marks", () => {
    const mock = interpret(mockMachine).onTransition((state) => {
      if (state.event.type !== "HIGHLIGHT") {
        return;
      }

      expect(state.context.highlight).toBe(state.event.digit);
    });

    mock.start();

    mock.send({ type: "HIGHLIGHT", digit: 1 });
    mock.send({ type: "HIGHLIGHT", digit: 2 });
    mock.send({ type: "HIGHLIGHT", digit: 0 });
  });
});
