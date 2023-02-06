import { assign, createMachine } from "xstate";
import { Cells, Grid } from "../generator/types";
import { generate, getPeerDigits, initializeGrid } from "../generator/sudoku";
import constants from "../generator/constants";

type SudokuContext = {
  grid: Grid;
  cursor: string;
  timePassed: number;
  difficulty: number;
};

type DirectionValues = ["up", "down", "left", "right"];
export type Direction = DirectionValues[number];

type SudokuEvent =
  | { type: "STARTGAME" }
  | { type: "NEWGAME" }
  | { type: "WINGAME" }
  | { type: "RESETGAME" }
  | { type: "CONTINUE" }
  | { type: "SETCURSOR"; cell: string }
  | { type: "MOVECURSOR"; direction: Direction; subgrid?: boolean }
  | { type: "TOGGLEMARK"; cell: string; mark: number }
  | { type: "SETCELL"; cell: string; digit: number };

export const sudokuMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QGUCuED2BrVBZAhgMYAWAlgHZgB0FpALqfgDYDEyAKgIIBK7A4p1wBRANoAGALqJQABwyx6pDOWkgAHogAcmqgE5dAJgCMmgOxjNYgCwA2c7oA0IAJ6IAzDbFUDAVjFiDGwNTXStA4IBfCKc0TBwCEgpqGSZ8ZwooFgB1AEkAOQFhcSkkEDkFBmVVDQRQvX0Gn0tbeydXBCNdHypTP39TYK7AqyMomPRsPCIySioUtIyqAHd8RXI6MAAnIkryFlwAeQA1IQBhAFVuZAPuYtVyxSrSmrNu0J8DDzsmps029zENioVgauk8gR8VkBNjGIFikwSM2SqXS5Cgy1WDHWWx2Sj2hxOFyuN2Q5wAQnxuDkACJ3UoPXbVLRhKieXRuIxGNxg0xuNx-FzuHxA3z+MS6TS6XrCmHROETeLTJJzFGLFZrDbbQi7FjsA58PgAGSEuB4AGk6bJ5I8VM8tDYrHo3KYrD5nT5TJKuf8EGE3N4+uLJdKbDYfLD4YrErN5qj0eqsZrccoWNwhMghPxBKJJPdrYy7Qgw0DDCYjFYXT4jP43D7AroqJo+W5ITXLKZTBGFVNo8iFmiMRqcdq8WxM6chIbDZayvm8UzfTYG2JPWIPX53dy6y6qIGwtYrJoDJofOG5ZGe0iVf30SQwIQsEsKCxTgc8ux8uccyUrRV54XT39WwzAMIMbGrJofRBUwqDFAIoX0AwJTcKwuziS9lSWFM8iELJCm-PM-yeUAai6HowTMV1mjscU6yXRtm1bMR+RXTtz27RFlVjNVMQoJMRxTDN2CJa5blzek52I9REA7IFOVMTlnQMXwPAFdo-AMAN-ChQ9OTsMEojlcgMAgOBVAvTjKEIm0FwAWksKCYKbPk-BMXROWsNw0IRJVZloBhmGsgsSMQWykJ9DwvFFAIghCMJYu8qMr24tEgv-EKEDcMQjD0QFjGsE9LH8HwfS5bpmxQmxnSsEYOTY8Z0Msvs40HRNh2C2ciNtDKwy8eTFIGFSbDUxARi8OCdM0PSQllBqfN7a8WrvB8n26zqbMLFCG10PLq0PJoxRKwVMrqEY7GrLlXiq1D2Ma3zqCwtaGXS6SEFstwDDrbKGJcqFmPbNioiAA */
  createMachine<SudokuContext, SudokuEvent>(
    {
      states: {
        initial: {
          on: {
            STARTGAME: "playing",
          },
        },

        playing: {
          entry: ["generateGrid"],

          on: {
            WINGAME: "won",
          },

          states: {
            waitinteraction: {
              on: {
                MOVECURSOR: {
                  target: "waitinteraction",
                  actions: ["moveCursor"],
                  internal: true,
                },

                TOGGLEMARK: {
                  target: "waitinteraction",
                  internal: true,
                },

                RESETGAME: "#SudokuMachine.playing",

                SETCELL: {
                  target: "checkwin",
                  cond: "isValidSetCell",
                  actions: ["setCell"],
                },

                SETCURSOR: {
                  target: "waitinteraction",
                  cond: "isValidSetCursor",
                  actions: ["setCursor"],
                  internal: true,
                },
              },
            },

            checkwin: {
              entry: ["checkWin"],
              on: {
                CONTINUE: "waitinteraction",
              },
            },
          },

          initial: "checkwin",
        },

        won: {
          on: {
            NEWGAME: "playing",
          },
        },
      },
      context: {
        grid: initializeGrid(),
        cursor: "A1",
        timePassed: 0,
        difficulty: 30,
      },
      initial: "initial",
      id: "SudokuMachine",
    },
    {
      actions: {
        generateGrid: assign({
          grid: () => generate(30),
        }),
        checkWin: async () => {
          console.log("hei");
        },
        setCell: assign({
          grid: (context, event) => {
            if (event.type !== "SETCELL") {
              throw Error(`setCell called by ${event.type}`);
            }
            context.grid.cells[event.cell].digit = event.digit;
            return context.grid;
          },
        }),
        setCursor: assign({
          cursor: (context, event) => {
            if (event.type !== "SETCURSOR") {
              throw Error(`setCursor called by ${event.type}`);
            }
            return event.cell;
          },
        }),
        moveCursor: assign({
          cursor: (context, event) => {
            if (event.type !== "MOVECURSOR") {
              throw Error(`moveCursor called by ${event.type}`);
            }

            const [row, col] = context.cursor.split("");
            const colNum = Number.parseInt(col);
            function toCell(r: string, c: string | number) {
              return r + c;
            }

            switch (event.direction) {
              case "left":
                if (colNum > 1) {
                  return toCell(row, colNum - 1);
                }
                break;
              case "right":
                if (colNum < 9) {
                  return toCell(row, colNum + 1);
                }
                break;
              case "up":
                if (row > "A") {
                  return toCell(
                    String.fromCharCode(row.charCodeAt(0) - 1),
                    col
                  );
                }
                break;
              case "down":
                if (row < "I") {
                  return toCell(
                    String.fromCharCode(row.charCodeAt(0) + 1),
                    col
                  );
                }
                break;
            }

            return context.cursor;
          },
        }),
      },
      guards: {
        isValidSetCell: (context, event) => {
          if (event.type !== "SETCELL") {
            return false;
          }

          if (!constants.CELLS.includes(event.cell)) {
            return false;
          }

          if (context.grid.prefilled.has(event.cell)) {
            return false;
          }

          const peerDigits = getPeerDigits(context.grid.cells, event.cell);
          if (peerDigits.has(event.digit)) {
            return false;
          }

          return true;
        },
        isValidSetCursor: (context, event) => {
          if (event.type !== "SETCURSOR") {
            return false;
          }

          return constants.CELLS.includes(event.cell);
        },
      },
    }
  );
