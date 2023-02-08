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
  highlight: number;
  past: Grid[];
  future: Grid[];
};

type DirectionValues = ["up", "down", "left", "right"];
export type Direction = DirectionValues[number];

type SudokuEvent =
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
  /** @xstate-layout N4IgpgJg5mDOIC5QGUCuED2BrVBZAhgMYAWAlgHZgB0ADgDb4CeFUVA7vqQC4VdgBORHhnIBiXAHkAagFEAwgFUASsglKA2gAYAuolA0MsbqRF6QAD0QAOAOwBWKgE4ALHYBMAZgBsX+1btWVgA0IIyIHppeVM6OsY5emm5eds6RXgC+6SFomDgEJBTU9Ews7Jw85HyChMJiACoSAOKNADIyuACCSgDSWrpIIAZGtWaWCFZezk4eNq4zdjZWjgCMHiFhCM6eVG52mvuOS-Z2PnaZ2ejYeERklLQMzOSsHMaVAkImYkoyyDJ1jR1cDI+mYhsZTAMxskoo43MsrMtnLM7Mt9mtQogko4qFYPHiUmirJobDZziAcld8rcig9Si8KlUPiJRL86nIZC0WiCBmCRpDwo4PFQEh43IlYjZNBE3OtMV4rNFVt5Em5HCTNMszllyZc8jdCvcSk8yq9GTVPiy-ooVGpufpDODyKNECSostljZ3TM3LtvMEMQg9m4dntNKlnAjlr54mSKXqCndio9nuVeO9zcyFAA5AAiEjtgwdfNAYzsLmiVjFbn88VVcNlCGSNiodhRgtFzlcXmWbljuuuCZpRpTpvTtVE3zzBd5n2dCBsap2zi8jhOuwOswbkwcVmcUclE1cla1F1yA+phuTJoZY4tAAkAJKNO8tJ93urTouz-mbXfCjyCoKUqaO4EbOA2MQKksHgLDYbg2KKmqrn2Z5UgaSalCQYCEFgbAUKIn7DN+JYClE8o9rCcK4rEDbuFESLJBMhxRhMJ46qh+qJrSxpYTheFiOoyz9PaREQiRCAAWRCJ1lRAGOFuqLRDYyRlos3jLIKKGUpx1BsMyWYyAA6gCQKEY6c6rlQC7ysiRLLpK8kBliOJ4jBqRSkSJKZNq5AYBAcBmHG56FKCX5iRYiAALREhB9FKgkPpqpKmpafGF4YU8oWiU6P4RMsTiRHCYb+ES+x2A2SpOPFKpJRqbFBWhXHDteabVMWhbZXOySaFQ7qeqscG+vKEGKfs+zhpG0YZNqDU6ZemHENhuEUFl5m5TEBVeEVEYBGN5UBgBUx7r4qKrLYJweM4qXBXcek5SJa3iZFooNmK+W4vi7keJ5pLeUAA */
  createMachine<SudokuContext, SudokuEvent>(
    {
      predictableActionArguments: true,
      preserveActionOrder: true,
      states: {
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
        highlight: 0,
        past: [],
        future: [],
      },
      initial: "playing",
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
          highlight: (context, event) => {
            if (event.type !== "HIGHLIGHT") {
              throw Error(`highlight called by ${event.type}`);
            }

            return event.digit;
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
