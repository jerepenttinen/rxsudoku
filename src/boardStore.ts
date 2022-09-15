import create from "zustand";
import produce from "immer";
import C from "@/constants";

type Cell = {
  digit: string;
  marks: string;
}

type Cells = {
  // A1 A2 A3 ... I7 I8 I9
  [cell: string]: Cell;
}

type BoardStore = {
  cells: Cells;
  time: number;
  newGrid: string;
  setNewGrid: (grid: string) => void;
  loadGrid: () => void;
}

export const useBoardStore = create<BoardStore>((set) => ({
  cells: Object.fromEntries(
    C.CELLS.map((cellId) => [cellId, {} as Cell])
  ),
  time: 0,
  newGrid: "",
  setNewGrid(grid) {
    set(
      produce((draft) => {
        draft.newGrid = grid;
      })
    )
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
          console.log(grid.length)
          throw Error("Grid has to be 81 characters long!");
        }

        for (const [i, v] of grid.entries()) {
          draft.cells[C.CELLS[i]] = {digit: v, marks: ""} as Cell;
        }
      })
    );
  },
}));