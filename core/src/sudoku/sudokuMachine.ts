import { assign, createMachine, actions, spawn } from "xstate";
import { Grid } from "../generator/types";
import { generate, getPeerDigits, initializeGrid } from "../generator/sudoku";
import constants from "../generator/constants";
import { nextCell, nextCellBySubgrid } from "./movements";
import { randInt } from "../generator/utils";

type SudokuContext = {
  grid: Grid;
  cursor: string;
  timePassed: number;
  difficulty: number;
  highlight: number;
  past: Grid[];
  future: Grid[];
  slamRef: any;
};

type DirectionValues = ["up", "down", "left", "right"];
export type Direction = DirectionValues[number];

type SudokuEvent =
  | { type: "NEWGAME" }
  | { type: "RESETGAME" }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "SLAM" }
  | { type: "HIGHLIGHT"; digit: number }
  | { type: "SETCURSOR"; cell: string }
  | { type: "MOVECURSOR"; direction: Direction; subgrid?: boolean }
  | { type: "TOGGLEMARK"; cell: string; mark: number }
  | { type: "SETCELL"; cell: string; digit: number };

const { send, cancel, sendUpdate } = actions;

const startSlamming = send(
  { type: "SLAM" },
  {
    delay: 2000,
    id: "slam",
  }
);

const cancelSlamming = cancel("slam");

export const sudokuMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QGUCuED2BrVBZAhgMYAWAlgHZgB0ADgDb4CeFUVA7vqQC4VdgBORHhnIBiXAHkAagFEAwgFUASsglKA2gAYAuolA0MsbqRF6QAD0QBGGwE4qtgCwBWAEwBmAGyeA7M4AcAT4ANCCMiK7+nlSOtnG2npquns6Omt4AvhmhaJg4BCQU1PRMLOycPOR8goTCYgAqEgDiTQAyMrgAgkoA0lq6SCAGRnVmlgi2Pv4O7j4us85TtlbuoeEIju7uVK7Omvu2-pPOzt7OWTno2HhEZJS0DMzkrBzGVQJCJmJKMsgy9U1OrgZP0zMNjKZBuMUtFbK4rP4rI45s4rPtVmEIp57P4tu5Uuj-JofD4LiBctcCndio8yq9KtVPiJRH96nIZK1WqDBuDRlDEO5EVREu5XEk4j5NO4kmsIvsYisvElXJNJVZztlyVd8rcig9Ss9ym9GbUviz-ooVGpufpDBDyGNEJNNFQbD4bLNXLsvP5ZQgTtNdvs0o5EVZPP4yRSdYV7iUni8KrwPqbmQoAHIAEQkNqGdr5oHGzicMX8Ysixc8KvhfpSPioJysti2rkcLk8VlcUe1N1jNINieNKbqoh+2dzvK+joQPkmO0c2NOQc0k0ctZcVH8jnDkqiLjLGsueV71P1CaNDOHZoAEgBJJrX1r36-1Cf5qf8jZb4XuZvNqWaG4oZrpiGyHJuzaLD4rg+KK6q2IeWrHlSerxmUJBgIQWBsBQohviMH6FgKCTCoi1bwricR+m40TIikUSHOGUSIdGJ6obShoYVhOFiOoVgDLaBGQkRCC-tEEadnCFG-rYtZojEPgpMWUxeE27jdshur3GwzLpjIADqgLAvh9rTghVCzhGKJEgukqyaByQ4niBJSkSJIaZSWn9ue9LJjUI7IK0QImQWFiIEsDgJAhVZ7Cucx+mKgaxSGYa+AkWSauQGAQHAZisShlBgu+wlhQgAC0RJ+mV8INlEnj4ghJyigEngeTGp5oc8RVCQ6n7SlYDjpPCmihgE+yAbWzgOIqiReqqmjqm1bFxhxg6Xv5hF5j104pC6boetB3oRn624uuNI0jalllLQV3nocQmHYRQ3WmX1sSDVWaKjUS+zOH6v6OAqvhois-h+PVjg3V57AlZOJXjGVooJQtm7OWkrnEqSGVAA */
  createMachine<SudokuContext, SudokuEvent>(
    {
      predictableActionArguments: true,
      preserveActionOrder: true,
      states: {
        playing: {
          entry: ["generateGrid"],

          states: {
            waitinteraction: {
              entry: [startSlamming],
              on: {
                MOVECURSOR: {
                  target: "waitinteraction",
                  actions: ["moveCursor"],
                  internal: true,
                },

                TOGGLEMARK: {
                  cond: "isValidToggleMark",
                  target: "waitinteraction",
                  internal: false,
                  actions: [cancelSlamming, "addToPast", "toggleMark"],
                },

                RESETGAME: "#SudokuMachine.playing",

                SETCELL: {
                  target: "checkwin",
                  cond: "isValidSetCell",
                  actions: [
                    cancelSlamming,
                    "addToPast",
                    "setCell",
                    "eliminateMarks",
                  ],
                  internal: false,
                },

                SETCURSOR: {
                  target: "waitinteraction",
                  cond: "isValidSetCursor",
                  actions: [cancelSlamming, "setCursor"],
                  internal: false,
                },

                UNDO: {
                  cond: "canUndo",
                  actions: [cancelSlamming, "undo"],
                  target: "waitinteraction",
                  internal: false,
                },

                REDO: {
                  cond: "canRedo",
                  actions: [cancelSlamming, "redo"],
                  target: "waitinteraction",
                  internal: false,
                },

                HIGHLIGHT: {
                  actions: ["highlight"],
                  target: "waitinteraction",
                  internal: true,
                },

                SLAM: {
                  target: "waitinteraction",
                  internal: false,
                  cond: "slamming",
                  actions: ["doSlamming"],
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
        slamRef: undefined,
      },
      initial: "playing",
      id: "SudokuMachine",
    },
    {
      actions: {
        doSlamming: assign({
          slamRef: (context) => {
            spawn((callback) => {
              const potential: string[] = [];
              for (const cellPos of constants.CELLS) {
                const cell = context.grid.cells[cellPos];
                if (context.grid.prefilled.has(cellPos)) {
                  continue;
                }

                if (cell.digit !== 0) {
                  continue;
                }

                let count = 0;
                for (let i = 1; i <= 9; i++) {
                  if (cell.marks[i]) {
                    count++;
                  }
                }

                if (count === 1) {
                  potential.push(cellPos);
                }
              }

              if (potential.length === 0) {
                return;
              }

              const chosenCellPos = potential[randInt(potential.length - 1)];
              const chosenCell = context.grid.cells[chosenCellPos];

              let mark = 0;
              for (let i = 1; i <= 9; i++) {
                if (chosenCell.marks[i]) {
                  mark = i;
                }
              }
              callback({ type: "SETCELL", cell: chosenCellPos, digit: mark });
            });
          },
        }),
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
        slamming: () => true,
      },
    }
  );
