import create from "zustand";
import produce from "immer";
import C from "@/constants";

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

function emptyMarks() {
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
};

type Cells = {
  // A1 A2 A3 ... I7 I8 I9
  [cell: string]: Cell;
};

type BoardStore = {
  cells: Cells;
  time: number;
  newGrid: string;
  setNewGrid: (grid: string) => void;
  loadGrid: () => void;
  toggleMark: (cell: string, mark: number) => void;
  setCellDigit: (cell: string, digit: number) => void;
};

export const useBoardStore = create<BoardStore>((set) => ({
  cells: Object.fromEntries(C.CELLS.map((cellId) => [cellId, {} as Cell])),
  time: 0,
  newGrid: "",
  setNewGrid(grid) {
    set(
      produce((draft) => {
        draft.newGrid = grid;
      })
    );
  },
  loadGrid() {
    set(
      produce((draft) => {
        const grid = draft.newGrid
          .replaceAll(".", "0")
          .replaceAll("-", "0")
          .split("")
          .filter((c: string) => C.ALLOWED_DIGITS.includes(c));

        if (grid.length !== 81) {
          console.log(grid.length);
          throw Error("Grid has to be 81 characters long!");
        }

        for (const [i, v] of grid.entries()) {
          draft.cells[C.CELLS[i]] = { digit: v, marks: emptyMarks() } as Cell;
        }
      })
    );
  },
  toggleMark(cell, mark) {
    set(
      produce((draft) => {
        draft.cells[cell].marks[mark] = !draft.cells[cell].marks[mark];
      })
    );
  },
  setCellDigit(cell, digit) {
    set(
      produce((draft) => {
        draft.cells[cell].digit = digit.toString();
      })
    );
  },
}));
