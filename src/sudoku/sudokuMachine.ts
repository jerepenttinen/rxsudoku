import { assign, createMachine, actions, spawn } from "xstate";
import { Grid } from "../generator/types";
import {
  getPeerDigits,
  initializeGrid,
  load,
  toStringLine,
} from "../generator/sudoku";
import constants from "../generator/constants";
import { nextCell, nextCellBySubgrid } from "./movements";
import { generate_grid_of_grade, is_win } from "./aivot";
import { ctz32, popcnt } from "../generator/utils";
import {
  getDigit,
  getMarks,
  isClue,
  isMarkHighlighted,
  isMarkHighlightedAlt,
  isMarked,
  removeHighlights,
  setDigit,
  toggleMark,
  toggleMarkHighlight,
  toggleMarkHighlightAlt,
} from "../generator/digit";

const DEFAULT_DELAY = 2000;
const MINIMUM_DELAY = 500;
const SLAM_FACTOR = 0.75;

type SudokuContext = {
  grid: Grid;
  cursor: string;
  timePassed: number;
  difficulty: number;
  highlight: number;
  past: Grid[];
  future: Grid[];
  slamRef: any;
  delay: number;
  timer: {
    started: number;
    current: number;
  };
};

type DirectionValues = ["up", "down", "left", "right"];
export type Direction = DirectionValues[number];

type SudokuEvent =
  | { type: "NEWGAME" }
  | { type: "RESETGAME"; difficulty: number }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "SLAM" }
  | { type: "TICKTIMER" }
  | { type: "HIGHLIGHT"; digit: number }
  | { type: "SETCURSOR"; cell: string }
  | { type: "MOVECURSOR"; direction: Direction; subgrid?: boolean }
  | { type: "TOGGLEMARK"; cell: string; mark: number }
  | {
      type: "HIGHLIGHTMARKS";
      conflicts: { cell: string; mark: number }[];
      setting: { cell: string; mark: number }[];
    }
  | { type: "SETCELL"; cell: string; digit: number }
  | { type: "SETCELLNO"; cell: string; digit: number };

const { send, cancel } = actions;

export const sudokuMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QGUCuED2BrVBZAhgMYAWAlgHZgB0ADgDb4CeFUVA7vqQC4VdgBORHhnIBiXAHkAagFEAwgFUASsglKA2gAYAuolA0MsbqRF6QAD0QBGGwE4qtgCwBWAEwBmAGyeA7M4AcAT4ANCCMiK7+nlSOtnG2npquns6Omt4AvhmhaJg4BCQU1PRMLOycPOR8goTCYgAqEgDiTQAyMrgAgkoA0lq6SCAGRnVmlgi2Pv4O7j4us85TtlbuoeEIju7uVK7Omvu2-pPOzt7OWTno2HhEZJS0DMzkrBzGVQJCJmIAEgCSTd9Wv9vvUur1kP0zMNjKZBuMrK5dg4fIjXJNNI4pqc1tY3FQUl4CbMpj45hcQLlrgU7sVHmVXpVqp8RKIlDJkDJ6k1OrgZJDBtDRnDEClorZXFZ-FZMS4rPtVmEIp57P4tu5UvL-JpSeTKflbkUHqVnuU3kzal9RBz6nIZK1Wvz9IYYeQxoh3FL8Zp3K4knEfN6kjiEL7NDEVl4kmjSZorOdshSrvrCvcSk8XhVeB8LSzrYoVGpHUNnULQON0VQbD4bLNEc4vP5gydprt9mlHFKrJ5-LqkzcU7TjRmzdm6qIFAA5AAiEiLgq+boQzicMX8vsiy88aIlwZSPioJysti2rkcLk8CN7eX7NKN6dNjNHlrZM7nJYXwoQPkmO0cytOraaJMji7i4VD+I4XYBlELhrvGlzXtShppvSmbvDUY5-ACQIAvUb4jB+ZaIB2jj4u4x7HoGbgkcGsTTEc6qkq4Pg+nGtjwYmiEGqmdImgyWYYZa9S-HIPTCbyGg6FC76wkRCArHicoYqemiqocEHBhKzhkR66ReIsiSnFeVLcYO978ehzJiMgrQ8vhLqLjY6TIp4Haiv4gQBMGAZUHMCTuJKqQpIcVjGcmt4oSaJBgIQWBsBQoj2aWFjugk+JStuEpqbYTbJDEPgpFEIXdikYU3shvGsNFsXxWI6hWAMToEbJKUIOR0Tdgi4pZeROWKggF5hpiKTLlMXhHu4ZVIfcbAshOMgAOrcrySWEa17G+Qk-hzAEGK+EBmnKuBaoat6Wo6uS5AYBAcBmHq5WUNJzWup+AC0WrBq9vrbK2HqOMkpKzEkU2mXeLBPQ5n7uLGDjpBKGKBFq+zOJ9NjaX4Z2nmk7j-ZsIMDmDfFoeayXzi14wpGGVY1iiuwNrRcpUPsbYIzYvgJPjEWVVQ1VxRQEPJeMOP2LYcNyh2u3I8G5GkZBvhyis22nDjnOGrNL1NZDcmvT6mkw6qWynbpF1ZEAA */
  createMachine<SudokuContext, SudokuEvent>(
    {
      predictableActionArguments: true,
      preserveActionOrder: true,
      states: {
        playing: {
          entry: ["generateGrid", "resetTimer"],
          invoke: {
            id: "timerInterval",
            src: () => (send) => {
              const id = setInterval(() => send({ type: "TICKTIMER" }), 1000);
              return () => clearInterval(id);
            },
          },

          states: {
            waitinteraction: {
              invoke: {
                src: (context) => (send) => {
                  const id = setTimeout(
                    () => send({ type: "SLAM" }),
                    context.delay,
                  );

                  return () => clearTimeout(id);
                },
              },
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
                  actions: [
                    "cancelSlamming",
                    "addToPast",
                    "removeHighlights",
                    "toggleMark",
                  ],
                },

                HIGHLIGHTMARKS: {
                  cond: "isValidHighlightMarks",
                  target: "waitinteraction",
                  internal: false,
                  actions: [
                    "cancelSlamming",
                    "removeHighlights",
                    "highlightMarks",
                  ],
                },

                RESETGAME: {
                  target: "#SudokuMachine.playing",
                  actions: [
                    "cancelSlamming",
                    "removeHighlights",
                    "setDifficulty",
                  ],
                },
                SETCELLNO: {
                  target: "checkwin",
                  cond: "isValidSetCell",
                  actions: [
                    "addToPast",
                    "removeHighlights",
                    "setCell",
                    "eliminateMarks",
                  ],
                  internal: false,
                },
                SETCELL: {
                  target: "checkwin",
                  cond: "isValidSetCell",
                  actions: [
                    "cancelSlamming",
                    "addToPast",
                    "removeHighlights",
                    "setCell",
                    "eliminateMarks",
                  ],
                  internal: false,
                },

                SETCURSOR: {
                  target: "waitinteraction",
                  cond: "isValidSetCursor",
                  actions: ["cancelSlamming", "setCursor"],
                  internal: false,
                },

                UNDO: {
                  cond: "canUndo",
                  actions: ["cancelSlamming", "undo"],
                  target: "waitinteraction",
                  internal: false,
                },

                REDO: {
                  cond: "canRedo",
                  actions: ["cancelSlamming", "redo"],
                  target: "waitinteraction",
                  internal: false,
                },

                HIGHLIGHT: {
                  actions: ["highlight"],
                  target: "waitinteraction",
                  internal: true,
                },

                TICKTIMER: {
                  actions: ["tick"],
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
        difficulty: Number(localStorage.getItem("difficulty") ?? "0"),
        highlight: 0,
        past: [],
        future: [],
        slamRef: undefined,
        delay: DEFAULT_DELAY,
        timer: {
          started: Date.now(),
          current: Date.now(),
        },
      },
      initial: "playing",
      id: "SudokuMachine",
    },
    {
      actions: {
        doSlamming: assign({
          slamRef: (context) => {
            spawn((callback) => {
              const chosen = {
                position: "",
                distance: 0,
              };
              const ACharCode = "A".charCodeAt(0);

              const [row, col] = context.cursor.split("");
              const cursorRow = Number.parseInt(col);
              const cursorCol = row.charCodeAt(0) - ACharCode + 1;

              for (const cellPos of constants.CELLS) {
                const cell = context.grid[cellPos];
                if (isClue(cell)) {
                  continue;
                }

                if (getDigit(cell) !== 0) {
                  continue;
                }

                let count = popcnt(getMarks(cell));

                if (count === 1) {
                  const [row, col] = cellPos.split("");
                  const colNum = Number.parseInt(col);
                  const rowNum = row.charCodeAt(0) - ACharCode + 1;

                  const distance = Math.hypot(
                    colNum - cursorCol,
                    rowNum - cursorRow,
                  );

                  if (chosen.position === "" || distance < chosen.distance) {
                    chosen.position = cellPos;
                    chosen.distance = distance;
                  }
                }
              }

              if (chosen.position === "") {
                return;
              }

              const chosenCell = context.grid[chosen.position];

              let mark = ctz32(getMarks(chosenCell)) + 1;

              callback({
                type: "SETCELLNO",
                cell: chosen.position,
                digit: mark,
              });
            });
            return;
          },
          delay: (context) => {
            return Math.max(context.delay * SLAM_FACTOR, MINIMUM_DELAY);
          },
        }),
        generateGrid: assign({
          grid: (context) => {
            const hardest = generate_grid_of_grade(context.difficulty);
            return load(hardest.grid);
          },
        }),
        setCell: assign({
          grid: (context, event) => {
            if (event.type !== "SETCELL" && event.type !== "SETCELLNO") {
              throw Error(`setCell called by ${event.type}`);
            }

            const grid = structuredClone(context.grid);
            grid[event.cell] = setDigit(grid[event.cell], event.digit);

            return grid;
          },
        }),
        toggleMark: assign({
          grid: (context, event) => {
            if (event.type !== "TOGGLEMARK") {
              throw Error(`toggleMark called by ${event.type}`);
            }

            const grid = structuredClone(context.grid);
            grid[event.cell] = toggleMark(grid[event.cell], event.mark);

            return grid;
          },
        }),
        removeHighlights: assign({
          grid: (context) => {
            const grid = structuredClone(context.grid);
            for (const cell of constants.CELLS) {
              grid[cell] = removeHighlights(grid[cell]);
            }
            return grid;
          },
        }),
        highlightMarks: assign({
          grid: (context, event) => {
            if (event.type !== "HIGHLIGHTMARKS") {
              throw Error(`highlightMarks called by ${event.type}`);
            }

            const grid = structuredClone(context.grid);

            for (const it of event.conflicts) {
              if (!isMarkHighlighted(grid[it.cell], it.mark)) {
                grid[it.cell] = toggleMarkHighlight(grid[it.cell], it.mark);
              }
            }

            for (const it of event.setting) {
              if (!isMarkHighlightedAlt(grid[it.cell], it.mark)) {
                grid[it.cell] = toggleMarkHighlightAlt(grid[it.cell], it.mark);
              }
            }

            return grid;
          },
        }),
        eliminateMarks: assign({
          grid: (context, event) => {
            if (event.type !== "SETCELL" && event.type !== "SETCELLNO") {
              throw Error(`eliminateMarks called by ${event.type}`);
            }

            const peers = constants.PEERS.get(event.cell)!;
            const grid = structuredClone(context.grid);

            for (const peer of peers) {
              if (isMarked(context.grid[peer], event.digit)) {
                grid[peer] = toggleMark(grid[peer], event.digit);
              }
            }

            return grid;
          },
        }),
        setDifficulty: assign({
          difficulty: (_, event) => {
            if (event.type !== "RESETGAME") {
              throw Error(`setDifficulty called by ${event.type}`);
            }
            localStorage.setItem("difficulty", event.difficulty.toString());
            return event.difficulty;
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
        cancelSlamming: assign({
          delay: (context) => DEFAULT_DELAY,
        }),
        resetTimer: assign({
          timer: (_) => ({
            started: Date.now(),
            current: Date.now(),
          }),
        }),
        tick: assign({
          timer: (context) => ({
            ...context.timer,
            current: Date.now(),
          }),
        }),
      },
      guards: {
        isWin: (context) => {
          return is_win(toStringLine(context.grid));
        },
        isValidSetCell: (context, event) => {
          if (event.type !== "SETCELL" && event.type !== "SETCELLNO") {
            return false;
          }

          if (!constants.CELLS.includes(event.cell)) {
            return false;
          }

          if (isClue(context.grid[event.cell])) {
            return false;
          }

          const peerDigits = getPeerDigits(context.grid, event.cell);
          return !peerDigits.has(event.digit);
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

          const peerDigits = getPeerDigits(context.grid, event.cell);
          return !peerDigits.has(event.mark);
        },
        isValidHighlightMarks: (context, event) => true,
        canUndo: (context) => context.past.length > 0,
        canRedo: (context) => context.future.length > 0,
        slamming: () => true,
      },
    },
  );
