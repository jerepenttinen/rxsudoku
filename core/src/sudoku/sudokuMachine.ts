import { assign, createMachine } from "xstate";
import { Grid } from "../generator/types";
import { generate, getPeerDigits, initializeGrid } from "../generator/sudoku";
import constants from "../generator/constants";
import { nextCell, nextCellBySubgrid } from "./movements";

type SudokuContext = {
  grid: Grid;
  cursor: string;
  timePassed: number;
  difficulty: number;
  past: Grid[];
  future: Grid[];
};

type DirectionValues = ["up", "down", "left", "right"];
export type Direction = DirectionValues[number];

type SudokuEvent =
  | { type: "STARTGAME" }
  | { type: "NEWGAME" }
  | { type: "RESETGAME" }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "HIGHLIGHT"; digit: number }
  | { type: "SETCURSOR"; cell: string }
  | { type: "MOVECURSOR"; direction: Direction; subgrid?: boolean }
  | { type: "TOGGLEMARK"; cell: string; mark: number }
  | { type: "SETCELL"; cell: string; digit: number };

export const sudokuMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QGUCuED2BrVBZAhgMYAWAlgHZgB0FpALqfgDYDEyAKgIIBK7A4p1wBRANoAGALqJQABwyx6pDOWkgAHogAcmqgE5dAJgCMmgOxjNYgCwA2c7oA0IAJ6IAzDbFUDAVjFiDGwNTXStA4IBfCKc0TBwCEgpqGSZ8ZwooKgB3fEVyOjAAJyIGZRZcAHkANSEAYQBVbmQK7nEpJBA5BVKVDo0EMx89Kx8DDzsfTUnNJ1cENzEbKit9fU9AnytFmyiY9Gw8IjJKKhS0jOzchnyikqVyFnYKvj4AGSFcHgBpNtUuxWUqn6mhsVj0blMIwhPlMml0Rjcs0QYTc3j8-l0cNMPh8NhsPl2IFiBwSx2SqXS5EyOTyBWKhB6LG4QmQQn4glEkj+8gBvVA-XxS0MJiMVkhPiM-kRLkQgV0VE0biVmylllMpkJxPiRySpwpFxp1zpdzKrPYtSEr1evw6-x6QPculRnjcBgC+nMCwMSIQgR0VgRHgCBl06rERgJ0SJ+21iROZ0p1KuFGNDPubDZDSaLRtsh59r6iHVSyMRlMpYhBl8HhmMoQfgMaP8WysmlLdl0OyjWsOcfJ5ypl1ptzTZXqADkACIVXOdfP3B310LLTRugxTTsh4w+-GmKg4oxO11WEY2IwGTUx3tkvUDpPD+mM5nT2d2heFhAhPcGWy6XG+DFIR3EYFQDOwLFBSZfEvOJr11BMLhIMBCCwLIKBYV950BD83E7KgbDbLdjEVfQfVGJYxXxEFMSMAj8RgkkdXjfVByQlC0IeEQjHaPNunfflHSWAjz0MYjcMcOszy8SicVDRUzydBjYxvLIynHIQAHUBGETC+OwgSED-KgQgI8VLFsewfTlBUlTcFUxDcNUNW7K9SXglj7yNEdGQACQAST4HzXgCnz2F03lF1bMEbFw2KHLEUYop9FYdDhOz1WCV0Iz-KIo3IDAIDgVQezcyhuT0vl1EQABaSxkoowMoL8LKVisJS4JOWgGGYcqIo-aqQx9IMmwCIIQjCMb2tK-tE16gsDIWIw9EWYxrCmSx-B8H1Az0QMzwWNwTA8SM9lg6bb0TIcvMffi5wqxd8S8UtywRUwqx8GtkslKh-GbNb2xMqamJmxDiGQ1CKDm27+jcFZlqCSVW0mX6trrXCwTA8tw0c7EYralyzuB7J9LuvqDOq10rPDGzlS2BynNyiIgA */
  createMachine<SudokuContext, SudokuEvent>(
    {
      predictableActionArguments: true,
      preserveActionOrder: true,
      states: {
        initial: {
          on: {
            STARTGAME: "playing",
          },
        },

        playing: {
          entry: ["generateGrid"],

          states: {
            waitinteraction: {
              on: {
                MOVECURSOR: {
                  target: "waitinteraction",
                  actions: ["moveCursor"],
                  internal: true,
                },

                TOGGLEMARK: {
                  cond: "isValidToggleMark",
                  target: "waitinteraction",
                  internal: true,
                  actions: ["addToPast", "toggleMark"],
                },

                RESETGAME: "#SudokuMachine.playing",

                SETCELL: {
                  target: "checkwin",
                  cond: "isValidSetCell",
                  actions: ["addToPast", "setCell", "eliminateMarks"],
                },

                SETCURSOR: {
                  target: "waitinteraction",
                  cond: "isValidSetCursor",
                  actions: ["setCursor"],
                  internal: true,
                },

                UNDO: {
                  cond: "canUndo",
                  actions: ["undo"],
                  target: "waitinteraction",
                  internal: true,
                },

                REDO: {
                  cond: "canRedo",
                  actions: ["redo"],
                  target: "waitinteraction",
                  internal: true,
                },

                HIGHLIGHT: {
                  actions: ["highlight"],
                  target: "waitinteraction",
                  internal: true,
                },
              },
            },

            checkwin: {
              always: [
                {
                  target: "#SudokuMachine.won",
                  cond: "isWin",
                },
                "waitinteraction",
              ],
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
        past: [],
        future: [],
      },
      initial: "initial",
      id: "SudokuMachine",
    },
    {
      actions: {
        generateGrid: assign({
          grid: () => generate(30),
        }),
        setCell: assign({
          grid: (context, event) => {
            if (event.type !== "SETCELL") {
              throw Error(`setCell called by ${event.type}`);
            }
            return {
              ...context.grid,
              cells: {
                ...context.grid.cells,
                [event.cell]: {
                  ...context.grid.cells[event.cell],
                  digit: event.digit,
                },
              },
            };
          },
        }),
        toggleMark: assign({
          grid: (context, event) => {
            if (event.type !== "TOGGLEMARK") {
              throw Error(`toggleMark called by ${event.type}`);
            }

            const marks = structuredClone(context.grid.cells[event.cell].marks);
            marks[event.mark] = !marks[event.mark];

            return {
              ...context.grid,
              cells: {
                ...context.grid.cells,
                [event.cell]: {
                  ...context.grid.cells[event.cell],
                  marks,
                },
              },
            };
          },
        }),
        eliminateMarks: assign({
          grid: (context, event) => {
            if (event.type !== "SETCELL") {
              throw Error(`eliminateMarks called by ${event.type}`);
            }

            const peers = constants.PEERS.get(event.cell);

            const newCells = structuredClone(context.grid.cells);
            for (const peer of peers) {
              newCells[peer].marks[event.digit] = false;
            }

            return { ...context.grid, cells: newCells };
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

            if (event.subgrid) {
              return nextCellBySubgrid(context.cursor, event.direction);
            } else {
              return nextCell(context.cursor, event.direction);
            }
          },
        }),
        highlight: assign({
          grid: (context, event) => {
            if (event.type !== "HIGHLIGHT") {
              throw Error(`highlight called by ${event.type}`);
            }
            context.grid.highlighted = new Set();
            for (const cell of constants.CELLS) {
              const marks = context.grid.cells[cell].marks;
              if (marks[event.digit]) {
                context.grid.highlighted.add(cell);
              }
            }
            return context.grid;
          },
        }),
        addToPast: assign((context) => ({
          past: [...context.past, context.grid],
          future: [],
        })),
        undo: assign((context) => {
          const previous = context.past[context.past.length - 1];
          const newPast = context.past.slice(0, context.past.length - 1);
          return {
            past: newPast,
            grid: previous,
            future: [context.grid, ...context.future],
          };
        }),
        redo: assign((context) => {
          const next = context.future[0];
          const newFuture = context.future.slice(1);
          return {
            past: [...context.past, context.grid],
            grid: next,
            future: newFuture,
          };
        }),
      },
      guards: {
        isWin: (context, event) => false,
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
        isValidToggleMark: (context, event) => {
          if (event.type !== "TOGGLEMARK") {
            return false;
          }

          const peerDigits = getPeerDigits(context.grid.cells, event.cell);
          return !peerDigits.has(event.mark);
        },
        canUndo: (context) => context.past.length > 0,
        canRedo: (context) => context.future.length > 0,
      },
    }
  );