import create from "zustand";
import { devtools } from "zustand/middleware";
import produce, { applyPatches, enablePatches, Patch } from "immer";
import C from "@/constants";
import { shuffled, range, difference, clamp } from "@/utilFuncs";
import generateSudokuGrid from "@/sudokuWasm";
import { broadcast } from "@/events";

enablePatches();

let changes: Patch[][] = [];
let inverseChanges: Patch[][] = [];

function produceChanges<T>(edit: (state: T) => T | void | undefined) {
  return (state: T) =>
    produce(state, edit, (patches: Patch[], inversePatches: Patch[]) => {
      changes.push(patches);
      inverseChanges.push(inversePatches);
    });
}

type Marks = {
  1: boolean;
  2: boolean;
  3: boolean;
  4: boolean;
  5: boolean;
  6: boolean;
  7: boolean;
  8: boolean;
  9: boolean;
  [num: number]: boolean;
};

function emptyMarks(): Marks {
  return {
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
    7: false,
    8: false,
    9: false,
  };
}

type Cell = {
  digit: number;
  marks: Marks;
  prefilled: boolean;
  highlighted: boolean;
  isCurrent: boolean;
};

type Cells = {
  // A1 A2 A3 ... I7 I8 I9
  [cell: string]: Cell;
};

type Direction = "up" | "down" | "left" | "right";

export type BoardStore = {
  cells: Cells;
  filled: number;
  generateGrid: (prefillCount: number) => void;
  generateGridSlow: (prefillCount: number) => void;
  loadGrid: (newGrid: string) => void;
  toggleMark: (cell: string, mark: number) => void;
  setCellDigit: (cell: string, digit: number) => void;
  currentCell: string;
  setCurrentCell: (cell: string) => void;
  setCurrentCellDigit: (digit: number) => void;
  toggleCurrentCellMark: (mark: number) => void;
  moveCurrentCell: (direction: Direction) => void;
  moveCurrentCellByBlock: (direction: Direction) => void;
  highlightedCandidates: number;
  setHighlightedCandidates: (candidate: number) => void;
  toggleCurrentCellHighlightedMark: () => void;
  toggleCurrentCellHighlightedDigit: () => void;
  undo: () => void;
};

export const useBoardStore = create(
  devtools<BoardStore>((set) => ({
    cells: Object.fromEntries(C.CELLS.map((cellId) => [cellId, {} as Cell])),
    filled: 0,
    generateGridSlow(prefillCount) {
      changes = [];
      inverseChanges = [];
      set(
        produce((draft: BoardStore) => {
          initializeGrid(draft);
          console.time("JS");
          generateGrid(draft.cells);
          removeDigitsFromGrid(draft.cells, prefillCount);
          for (const cellPos of C.CELLS) {
            const cell = draft.cells[cellPos];
            if (cell.digit !== 0) {
              cell.prefilled = true;
              draft.filled++;
            }
          }
          markUnfilledCells(draft, C.CELLS);
          console.timeEnd("JS");
        })
      );
    },
    async generateGrid(prefillCount) {
      console.time("WASM");
      const gridStr = await generateSudokuGrid(prefillCount);
      changes = [];
      inverseChanges = [];

      set(
        produce((draft: BoardStore) => {
          loadGrid(draft, gridStr);
          markUnfilledCells(draft, C.CELLS);
        })
      );
      console.timeEnd("WASM");
    },
    loadGrid(newGrid) {
      set(
        produce((draft: BoardStore) => {
          loadGrid(draft, newGrid);
          markUnfilledCells(draft, C.CELLS);
        })
      );
    },
    toggleMark(cell, mark) {
      set(
        produceChanges((draft: BoardStore) => {
          toggleCellMark(draft, cell, mark);
        })
      );
    },
    setCellDigit(cell, digit) {
      // Hack to remove click changes from double click
      if (inverseChanges.length >= 2) {
        const last = inverseChanges.at(-1)?.at(0);
        const secondLast = inverseChanges.at(-2)?.at(0);

        if (
          last?.op === secondLast?.op &&
          last?.value !== secondLast?.value &&
          JSON.stringify(last?.path) === JSON.stringify(secondLast?.path)
        ) {
          inverseChanges.splice(inverseChanges.length - 2, 2);
        }
      }
      set(
        produceChanges((draft: BoardStore) => {
          setCellDigit(draft, cell, digit);
        })
      );
    },
    currentCell: "",
    setCurrentCell(cell) {
      set(
        produce((draft: BoardStore) => {
          setCurrentCell(draft, cell);
        })
      );
    },
    setCurrentCellDigit(digit) {
      set(
        produceChanges((draft: BoardStore) => {
          setCellDigit(draft, draft.currentCell, digit);
        })
      );
    },
    toggleCurrentCellMark(mark) {
      set(
        produceChanges((draft: BoardStore) => {
          toggleCellMark(draft, draft.currentCell, mark);
        })
      );
    },
    moveCurrentCell(direction) {
      set(
        produce((draft: BoardStore) => {
          if (draft.currentCell === "") {
            setCurrentCell(draft, "A1");
          }

          const [row, col] = draft.currentCell.split("");
          const colNum = Number.parseInt(col);
          function setCell(r: string, c: string | number) {
            console.log(r + c);
            setCurrentCell(draft, r + c);
          }

          switch (direction) {
            case "left": {
              if (colNum > 1) {
                setCell(row, colNum - 1);
              }
              break;
            }
            case "right": {
              if (colNum < 9) {
                setCell(row, colNum + 1);
              }
              break;
            }
            case "up": {
              if (row > "A") {
                setCell(String.fromCharCode(row.charCodeAt(0) - 1), col);
              }
              break;
            }
            case "down": {
              if (row < "I") {
                setCell(String.fromCharCode(row.charCodeAt(0) + 1), col);
              }
              break;
            }
          }
        })
      );
    },
    moveCurrentCellByBlock(direction) {
      set(
        produce((draft: BoardStore) => {
          if (draft.currentCell === "") {
            setCurrentCell(draft, "A1");
          }

          const [row, col] = draft.currentCell.split("");
          const colNum = Number.parseInt(col);
          const ACharCode = "A".charCodeAt(0);
          const rowNum = row.charCodeAt(0) - ACharCode + 1;

          function setCell(r: number, c: number) {
            setCurrentCell(
              draft,
              clamp("A", String.fromCharCode(r - 1 + ACharCode), "I") +
                clamp(1, c, 9)
            );
          }

          // outwards from the top/left
          function byBlock(num: number, outwards: boolean): number {
            let distanceFromEdge = (num - 1) % 3;
            if (outwards) {
              distanceFromEdge = 2 - distanceFromEdge;
            }
            const nextBlock = distanceFromEdge === 0 ? 3 : 0;

            return outwards
              ? num + distanceFromEdge + nextBlock
              : num - distanceFromEdge - nextBlock;
          }

          switch (direction) {
            case "left": {
              setCell(rowNum, byBlock(colNum, false));
              break;
            }
            case "right": {
              setCell(rowNum, byBlock(colNum, true));
              break;
            }
            case "up": {
              setCell(byBlock(rowNum, false), colNum);
              break;
            }
            case "down": {
              setCell(byBlock(rowNum, true), colNum);
              break;
            }
          }
        })
      );
    },
    highlightedCandidates: 0,
    setHighlightedCandidates(candidate) {
      set(
        produce((draft: BoardStore) => {
          // toggle off
          if (draft.highlightedCandidates === candidate) {
            draft.highlightedCandidates = 0;
            highlightCandidates(draft, 0);
          } else {
            draft.highlightedCandidates = candidate;
            highlightCandidates(draft, candidate);
          }
        })
      );
    },
    toggleCurrentCellHighlightedMark() {
      set(
        produceChanges((draft: BoardStore) => {
          toggleCellMark(draft, draft.currentCell, draft.highlightedCandidates);
        })
      );
    },
    toggleCurrentCellHighlightedDigit() {
      set(
        produceChanges((draft: BoardStore) => {
          setCellDigit(draft, draft.currentCell, draft.highlightedCandidates);
        })
      );
    },
    undo() {
      set(
        produce((draft: BoardStore) => {
          let change = inverseChanges.pop();
          // discard empty changes
          while (change !== undefined && change.length === 0) {
            change = inverseChanges.pop();
          }
          console.log(change);
          if (change !== undefined) {
            applyPatches(draft, change);
          }
          highlightCandidates(draft, draft.highlightedCandidates);
        })
      );
    },
  }))
);

export function setCurrentCell(state: BoardStore, cell: string) {
  if (state.cells[state.currentCell] !== undefined) {
    state.cells[state.currentCell].isCurrent = false;
  }
  state.cells[cell].isCurrent = true;
  state.currentCell = cell;
}

export function highlightCandidates(state: BoardStore, candidate: number) {
  for (const cell of C.CELLS) {
    const c = state.cells[cell];

    if (candidate === 0) {
      c.highlighted = false;
    } else if (c.marks !== undefined && c.marks[candidate]) {
      c.highlighted = true;
    } else {
      c.highlighted = false;
    }
  }
}

export function eliminateMarks(
  state: BoardStore,
  cellPos: string,
  digit: number
) {
  const peers = C.PEERS.get(cellPos);
  if (peers === undefined) {
    return;
  }

  for (const peerPos of peers) {
    const peer = state.cells[peerPos];
    peer.marks[digit] = false;
    if (state.highlightedCandidates === digit) {
      peer.highlighted = false;
    }
  }
}

export function setCellDigit(
  state: BoardStore,
  cellPos: string,
  digit: number
) {
  const cell = state.cells[cellPos];
  if (cell === undefined || cell.prefilled || cell.digit === digit) {
    return;
  }

  if (digit !== 0 && getPeerDigits(state, cellPos).has(digit)) {
    broadcast("unitConflict", `There's already ${digit} in this unit`);
    return;
  }

  if (cell.digit === 0 && digit !== 0) {
    state.filled++;
    if (state.filled === 81) {
      broadcast("gameOver", "");
    }
  } else if (cell.digit !== 0 && digit === 0) {
    state.filled--;
  }

  const lastDigit = cell.digit;
  cell.digit = digit;

  if (digit !== 0) {
    eliminateMarks(state, cellPos, digit);
  }
  markUnfilledCellsDigit(state, C.PEERS.get(cellPos)!, lastDigit);
}

export function initializeGrid(state: BoardStore) {
  // Initialize grid
  for (const cell of C.CELLS) {
    state.cells[cell] = {
      digit: 0,
      marks: emptyMarks(),
      prefilled: false,
      highlighted: false,
      isCurrent: false,
    } as Cell;
  }
  state.currentCell = "";
  state.filled = 0;
  state.highlightedCandidates = 0;
}

export function generateGrid(grid: Cells): boolean {
  const digits = new Set(range(1, 10));
  let cellPos = "";
  for (cellPos of C.CELLS) {
    if (grid[cellPos].digit === 0) {
      const peer = C.PEERS.get(cellPos);
      if (peer === undefined) {
        continue;
      }

      const peerDigits = new Set(
        Array.from(peer).map((pos) => grid[pos].digit)
      );

      const possibleDigits = shuffled(
        Array.from(difference(digits, peerDigits))
      );

      for (const digit of possibleDigits) {
        grid[cellPos].digit = digit;
        if (
          C.CELLS.map((pos) => grid[pos].digit).every((digit) => digit != 0) ||
          generateGrid(grid)
        ) {
          return true;
        }
      }
      break;
    }
  }
  grid[cellPos].digit = 0;
  return false;
}

export function removeDigitsFromGrid(grid: Cells, prefilledCellCount: number) {
  const filledCells = shuffled(structuredClone(C.CELLS));
  for (
    let filledCellsCount = filledCells.length;
    filledCellsCount > prefilledCellCount;
    filledCellsCount--
  ) {
    const cellPos = filledCells.pop();
    if (cellPos === undefined) {
      break;
    }
    const cell = grid[cellPos];

    const removedDigit = cell.digit;
    cell.digit = 0;

    if (!hasSingleSolution(structuredClone({ ...grid }), filledCellsCount)) {
      cell.digit = removedDigit;
      filledCellsCount++;
    }
  }
}

const digits = new Set(range(1, 10));

export function hasSingleSolution(
  grid: Cells,
  filledCellsCount: number
): boolean {
  let solutionCount = 0;
  const solver = (grid: Cells, depth: number): boolean => {
    for (const cellPos of C.CELLS) {
      if (grid[cellPos].digit !== 0) {
        continue;
      }

      const peers = C.PEERS.get(cellPos);
      if (peers === undefined) {
        continue;
      }

      const peerDigits = new Set(
        Array.from(peers).map((pos) => grid[pos].digit)
      );

      const possibleDigits = difference(digits, peerDigits);
      for (const digit of possibleDigits) {
        grid[cellPos].digit = digit;

        if (depth === 81) {
          solutionCount++;
          break;
        } else if (solver(grid, depth + 1)) {
          return true;
        }

        if (solutionCount > 1) {
          return false;
        }
      }
      grid[cellPos].digit = 0;
      break;
    }
    return false;
  };
  solver(grid, filledCellsCount);
  return solutionCount === 1;
}

export function loadGrid(state: BoardStore, newGrid: string) {
  const grid = newGrid
    .replaceAll(".", "0")
    .replaceAll("-", "0")
    .split("")
    .filter((c: string) => C.ALLOWED_DIGITS.includes(c))
    .map((n) => parseInt(n));

  if (grid.length !== 81) {
    throw Error("Grid has to be 81 characters long!");
  }

  for (const [i, v] of grid.entries()) {
    state.cells[C.CELLS[i]] = {
      digit: v,
      marks: emptyMarks(),
      prefilled: v !== 0,
      highlighted: false,
      isCurrent: false,
    } as Cell;
  }

  state.currentCell = "";
  state.highlightedCandidates = 0;
  state.filled = C.CELLS.map((pos) => state.cells[pos]).reduce(
    (acc, cur) => (cur.prefilled ? acc + 1 : acc),
    0
  );
}

function markUnfilledCells(state: BoardStore, cells: string[] | Set<string>) {
  for (const cellPos of cells) {
    const cell = state.cells[cellPos];
    if (cell.digit !== 0) {
      continue;
    }
    const possibleDigits = difference(digits, getPeerDigits(state, cellPos));

    for (const c of possibleDigits) {
      cell.marks[c] = true;
      if (state.highlightedCandidates === c) {
        cell.highlighted = true;
      }
    }
  }
}

function markUnfilledCellsDigit(
  state: BoardStore,
  cells: string[] | Set<string>,
  digit: number
) {
  for (const cellPos of cells) {
    const cell = state.cells[cellPos];
    if (cell.digit !== 0) {
      continue;
    }

    const possibleDigits = difference(digits, getPeerDigits(state, cellPos));
    cell.marks[digit] = possibleDigits.has(digit);

    if (
      state.highlightedCandidates !== 0 &&
      cell.marks[state.highlightedCandidates]
    ) {
      cell.highlighted = true;
    }
  }
}
export function getPeerDigits(state: BoardStore, cellPos: string) {
  const peers = C.PEERS.get(cellPos);
  if (peers === undefined) {
    throw Error(`Cell position ${cellPos} not found from peers!`);
  }
  return new Set(Array.from(peers).map((pos) => state.cells[pos].digit));
}

export function toggleCellMark(
  state: BoardStore,
  cellPos: string,
  mark: number
) {
  const cell = state.cells[cellPos];
  if (
    cell === undefined ||
    cell.prefilled ||
    cell.marks === undefined ||
    mark === 0
  ) {
    return;
  }

  if (getPeerDigits(state, cellPos).has(mark)) {
    broadcast("unitConflict", `There's already ${mark} in this unit`);
    return;
  }

  cell.marks[mark] = !cell.marks[mark];
  cell.highlighted = cell.marks[state.highlightedCandidates];
}
