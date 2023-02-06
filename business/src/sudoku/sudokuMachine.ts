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
  | { type: "RESETGAME" }
  | { type: "SETCURSOR"; cell: string }
  | { type: "MOVECURSOR"; direction: Direction; subgrid?: boolean }
  | { type: "TOGGLEMARK"; cell: string; mark: number }
  | { type: "SETCELL"; cell: string; digit: number };

export const sudokuMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QGUCuED2BrVBZAhgMYAWAlgHZgB0FpALqfgDYDEyAKgIIBK7A4p1wBRANoAGALqJQABwyx6pDOWkgAHogAcmqgE5dAJgCMmgOxjNYgCwA2c7oA0IAJ6IAzDbFUDAVjFiDGwNTXStA4IBfCKc0TBwCEgpqGSZ8ZwooKgB3fEVyOjAAJyIGZRZcAHkANSEAYQBVbmQK7nEpJBA5BVKVDo0EMx89Kx8DDzsfTUnNJ1cENzEbKit9fU9AnytFmyiY9Gw8IjJKKhS0jOzchnyikqVyFnYKvj4AGSFcHgBpNtUuxWUqn6mhsVj0blMIwhPlMml0Rjcs0QYTc3j8-l0cNMPh8NhsPl2IFiBwSx2SqXS5EyOTyBWKhB6LG4QmQQn4glEkj+8gBvVA-XxS0MJiMVkhPiM-kRLkQgV0VE0biVmylllMpkJxPiRySpwpFxp1zpdzKrPYtSEr1evw6-x6QPculRnjcBgC+nMCwMSIQgR0VgRHgCBl06rERgJ0SJ+21iROZ0p1KuFGNDPubDZDSaLRtsh59r6iHVSyMRlMpYhBl8HhmMoQfgMaP8WysmlLdl0OyjWsOceoWTKADkhAB1ATCXOdfP3B0IXRDEI2MwjSy2ew+uUKpVuFViNxqjXdmO9sl685UqgkMCELBZCgsSd2meF+adqhLowhqsmNz6H2jJYxXxEFMSMJd8U1Y9SV1BMLivG87weEQjHaPNumfflHSWD8v2MRU-zrGxJWWUx8R8UNFSIp0oijcgMAgOBVB7aDKG5dDARfABaSwfVsZZAx8JVOwDXFdEguIT11WgGGYNjeVnTiQx9IMmwCIIQjCdTxJJHV431Kk5ILTD5nDPRFmMawpksfwfB9QM9EDTxJnVTsxm02NT1gi9DRTW40w4tD5JffEvFLcsEVMKtBKXXjiP8ZtLPbRd3MkvTz0yeDbwoQyMPUdwVjMoJJVbSZ4tsutfzBAM7ElBFBhsNwrBSlj+wCqd2L5PKEE410N1MxVlS2PcDxoiIgA */
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
      },
    }
  );
