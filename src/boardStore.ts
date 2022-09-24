import create from "zustand";
import produce, { applyPatches, enablePatches, Patch } from "immer";
import C from "@/constants";
import { shuffled, range, difference } from "@/utilFuncs";
import generateSudokuGrid from "@/sudokuWasm";
import { broadcast } from "@/events";
import { stat } from "fs";

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

type BoardStore = {
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
  moveCurrentCell: (direction: string) => void;
  highlightedCandidates: number;
  setHighlightedCandidates: (candidate: number) => void;
  toggleCurrentCellHighlightedMark: () => void;
  toggleCurrentCellHighlightedDigit: () => void;
  undo: () => void;
};

export const useBoardStore = create<BoardStore>((set) => ({
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
          default: {
            throw Error("unknown direction: " + direction);
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
}));

function setCurrentCell(state: BoardStore, cell: string) {
  if (state.cells[state.currentCell] !== undefined) {
    state.cells[state.currentCell].isCurrent = false;
  }
  state.cells[cell].isCurrent = true;
  state.currentCell = cell;
}

function highlightCandidates(state: BoardStore, candidate: number) {
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

function eliminateMarks(state: BoardStore, cellPos: string, digit: number) {
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

function setCellDigit(state: BoardStore, cellPos: string, digit: number) {
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

  cell.digit = digit;

  if (digit !== 0) {
    eliminateMarks(state, state.currentCell, digit);
  } else {
    markUnfilledCells(state, C.PEERS.get(state.currentCell)!);
  }
}

function initializeGrid(state: BoardStore) {
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

function generateGrid(grid: Cells): boolean {
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

function removeDigitsFromGrid(grid: Cells, prefilledCellCount: number) {
  const filledCells = shuffled(structuredClone(C.CELLS));
  for (
    let filledCellsCount = filledCells.length, rounds = 3;
    filledCellsCount >= prefilledCellCount && rounds > 0;
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
      rounds--;
    }
  }
}

const digits = new Set(range(1, 10));

function hasSingleSolution(grid: Cells, filledCellsCount: number): boolean {
  let solutionCount = 0;
  const solver = (grid: Cells, depth: number) => {
    if (solutionCount > 1) {
      return false;
    }

    let cellPos = "";
    for (cellPos of C.CELLS) {
      if (grid[cellPos].digit === 0) {
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
          if (
            // C.CELLS.map((pos) => grid[pos].digit).every((digit) => digit !== 0)
            depth === 81
          ) {
            solutionCount++;
            return true;
          } else if (solver(grid, depth + 1)) {
            return true;
          }
        }
        break;
      }
    }
    grid[cellPos].digit = 0;
    return false;
  };
  solver(grid, filledCellsCount);
  return solutionCount === 1;
}

function loadGrid(state: BoardStore, newGrid: string) {
  const grid = newGrid
    .replaceAll(".", "0")
    .replaceAll("-", "0")
    .split("")
    .filter((c: string) => C.ALLOWED_DIGITS.includes(c))
    .map((n) => parseInt(n));

  if (grid.length !== 81) {
    console.log(grid.length);
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
  state.filled = grid.reduce((acc, curr) => (curr !== 0 ? acc + 1 : acc), 0);
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

function getPeerDigits(state: BoardStore, cellPos: string) {
  const peers = C.PEERS.get(cellPos);
  if (peers === undefined) {
    throw Error(`Cell position ${cellPos} not found from peers!`);
  }
  return new Set(Array.from(peers).map((pos) => state.cells[pos].digit));
}

function toggleCellMark(state: BoardStore, cellPos: string, mark: number) {
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
