import { describe, expect, it } from "vitest";
import { Direction, sudokuMachine } from "./sudokuMachine";
import { interpret } from "xstate";

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

  it("should move cursor correctly", () => {
    let current = 0;
    const inputs: { input: Direction; expected: string }[] = [
      {
        input: "down",
        expected: "B1",
      },
      {
        input: "up",
        expected: "A1",
      },
      {
        input: "right",
        expected: "A2",
      },
      {
        input: "left",
        expected: "A1",
      },
      {
        input: "left",
        expected: "A1",
      },
      {
        input: "up",
        expected: "A1",
      },
    ];

    const mockSudokuMachine = sudokuMachine.withConfig({
      actions: {
        generateGrid: () => {},
      },
    });

    const mock = interpret(mockSudokuMachine).onTransition((state) => {
      if (state.event.type === "MOVECURSOR" && current < inputs.length) {
        expect(state.context.cursor).toBe(inputs[current].expected);
        current++;
      }
    });

    mock.start();

    mock.send({ type: "STARTGAME" });

    for (const input of inputs) {
      mock.send({ type: "MOVECURSOR", direction: input.input });
    }

    mock.stop();
  });
});
