import create from "zustand";
import produce from "immer";
import C from "@/constants";
import { shuffled, randInt } from "@/utilFuncs";

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
  digit: string;
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
  loadGrid: (newGrid: string) => void;
  toggleMark: (cell: string, mark: number) => void;
  setCellDigit: (cell: string, digit: number) => void;
  currentCell: string;
  setCurrentCell: (cell: string) => void;
  setCurrentCellDigit: (digit: string) => void;
  toggleCurrentCellMark: (mark: number) => void;
  moveCurrentCell: (direction: string) => void;
  highlightedCandidates: number;
  setHighlightedCandidates: (candidate: number) => void;
};

export const useBoardStore = create<BoardStore>((set) => ({
  cells: Object.fromEntries(C.CELLS.map((cellId) => [cellId, {} as Cell])),
  generateGrid(prefillCount) {
    set(
      produce((draft: BoardStore) => {
        // Initialize grid
        for (const cell of C.CELLS) {
          draft.cells[cell] = {
            digit: "0",
            marks: emptyMarks(),
            prefilled: false,
            highlighted: false,
            isCurrent: false,
          } as Cell;
        }

        const prefillCells = shuffled(C.CELLS).slice(0, prefillCount);

        for (const cell of prefillCells) {
          const peers = C.PEERS.get(cell);
          if (peers === undefined) {
            throw Error("peers for " + cell + " are undefined!");
          }

          const possibleDigits = new Set(C.COLS);

          // Delete peers' digits
          for (const peer of peers) {
            possibleDigits.delete(draft.cells[peer].digit);
          }

          // Choose digit randomly from possible digits
          const chosenDigit =
            Array.from(possibleDigits)[randInt(possibleDigits.size - 1)];

          draft.cells[cell].digit = chosenDigit;
          draft.cells[cell].prefilled = true;
        }
      })
    );
  },
  loadGrid(newGrid) {
    set(
      produce((draft: BoardStore) => {
        const grid = newGrid
          .replaceAll(".", "0")
          .replaceAll("-", "0")
          .split("")
          .filter((c: string) => C.ALLOWED_DIGITS.includes(c));

        if (grid.length !== 81) {
          console.log(grid.length);
          throw Error("Grid has to be 81 characters long!");
        }

        for (const [i, v] of grid.entries()) {
          draft.cells[C.CELLS[i]] = {
            digit: v,
            marks: emptyMarks(),
            prefilled: v !== "0",
            highlighted: false,
            isCurrent: false,
          } as Cell;
        }
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
        draft.cells[cell].digit = digit.toString();
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
  setCurrentCellDigit(digit: string) {
    set(
      produce((draft: BoardStore) => {
        const cell = draft.cells[draft.currentCell];
        if (cell !== undefined && !cell.prefilled) {
          cell.digit = digit;
        }
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
