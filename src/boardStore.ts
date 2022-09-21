import create from "zustand";
import produce from "immer";
import C from "@/constants";
import { shuffled, randInt, range, difference } from "@/utilFuncs";
import generateSudokuGrid from "@/sudokuWasm";

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
};

export const useBoardStore = create<BoardStore>((set) => ({
  cells: Object.fromEntries(C.CELLS.map((cellId) => [cellId, {} as Cell])),
  generateGridSlow(prefillCount) {
    set(
      produce((draft: BoardStore) => {
        initializeGrid(draft);
        console.time("JS");
        generateGrid(draft.cells);
        removeDigitsFromGrid(draft.cells, prefillCount);

        markUnfilledCells(draft);
        console.timeEnd("JS");
      })
    );
  },
  async generateGrid(prefillCount) {
    console.time("WASM");
    const gridStr = await generateSudokuGrid(prefillCount);
    set(
      produce((draft: BoardStore) => {
        loadGrid(draft, gridStr);
        markUnfilledCells(draft);
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
      produce((draft: BoardStore) => {
        const cc = draft.cells[cell];
        cc.marks[mark] = !cc.marks[mark];
        cc.highlighted = cc.marks[draft.highlightedCandidates];
      })
    );
  },
  setCellDigit(cell, digit) {
    set(
      produce((draft: BoardStore) => {
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
      produce((draft: BoardStore) => {
        setCellDigit(draft, draft.currentCell, digit);
      })
    );
  },
  toggleCurrentCellMark(mark) {
    set(
      produce((draft: BoardStore) => {
        const cell = draft.cells[draft.currentCell];
        if (cell !== undefined && !cell.prefilled && cell.marks !== undefined) {
          cell.marks[mark] = !cell.marks[mark];
          cell.highlighted = cell.marks[draft.highlightedCandidates];
        }
      })
    );
  },
  moveCurrentCell(direction) {
    set(
      produce((draft: BoardStore) => {
        if (draft.currentCell === "") {
          draft.currentCell = "A1";
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
      produce((draft: BoardStore) => {
        const cell = draft.cells[draft.currentCell];
        if (
          cell !== undefined &&
          !cell.prefilled &&
          draft.highlightedCandidates !== 0 &&
          cell.marks !== undefined
        ) {
          cell.marks[draft.highlightedCandidates] =
            !cell.marks[draft.highlightedCandidates];
          cell.highlighted = !cell.highlighted;
        }
      })
    );
  },
  toggleCurrentCellHighlightedDigit() {
    set(
      produce((draft: BoardStore) => {
        setCellDigit(draft, draft.currentCell, draft.highlightedCandidates);
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
  if (cell !== undefined && !cell.prefilled) {
    cell.digit = digit;
    eliminateMarks(state, state.currentCell, digit);
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
}

function markUnfilledCells(state: BoardStore) {
  for (const cellPos of C.CELLS) {
    const cell = state.cells[cellPos];
    if (cell.digit !== 0) {
      cell.prefilled = true;
      continue;
    }

    const peers = C.PEERS.get(cellPos);
    if (peers === undefined) {
      throw Error("peers for " + cellPos + " are undefined!");
    }

    const possibleDigits = new Set(C.COLS.map((n) => parseInt(n)));

    // Delete peers' digits
    for (const peer of peers) {
      possibleDigits.delete(state.cells[peer].digit);
    }

    for (const c of possibleDigits) {
      cell.marks[c] = true;
    }
  }
}
