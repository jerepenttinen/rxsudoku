import {
  useBoardStore,
  BoardStore,
  initializeGrid,
  hasSingleSolution,
} from "@/boardStore";
import { renderHook } from "@testing-library/react";

import C from "@/constants";
import { act } from "react-dom/test-utils";

const originalState = useBoardStore.getState();
let state = {} as BoardStore;

describe("boardStore", () => {
  beforeEach(() => {
    renderHook(() => useBoardStore.setState(originalState));
    renderHook(() => (state = useBoardStore()));
    initializeGrid(state);
  });

  test("loadGrid", () => {
    act(() => {
      state.loadGrid(
        "..3.2.6..9..3.5..1..18.64....81.29..7.......8..67.82....26.95..8..2.3..9..5.1.3.."
      );
    });
    expect(state.filled).toBe(32);
    expect(state.currentCell).toBe("");
    expect(state.highlightedCandidates).toBe(0);
    expect(
      C.CELLS.map((pos) => state.cells[pos]).every(
        (cell) => (cell.digit !== 0) === cell.prefilled
      )
    ).toBe(true);
    expect(
      C.CELLS.map((pos) => state.cells[pos]).every(
        (cell) => cell.isCurrent || cell.highlighted
      )
    ).toBe(false);
  });

  test("empty after last one", () => {
    expect(state.filled).toBe(0);
  });

  test("load invalid grid", () => {
    // too short
    expect(() => state.loadGrid("12345")).toThrowError();
    // too long
    expect(() =>
      state.loadGrid(
        "1123451234512345123451234512345123451234512345123451234512345123451234512345123451"
      )
    ).toThrowError();
  });

  test("swap digit restore marks", () => {
    act(() => {
      state.loadGrid(
        "000000000000000000000000000000000000000000000000000000000000000000000000000000000"
      );
      state.setCellDigit("A1", 1);
    });
    expect(state.cells["A2"].marks[1]).toBe(false);
    expect(state.cells["A2"].marks[2]).toBe(true);

    act(() => {
      state.setCellDigit("A1", 2);
    });

    expect(state.cells["A2"].marks[1]).toBe(true);
    expect(state.cells["A2"].marks[2]).toBe(false);

    act(() => {
      state.setCellDigit("A1", 0);
    });

    expect(state.cells["A2"].marks[1]).toBe(true);
    expect(state.cells["A2"].marks[2]).toBe(true);
  });

  test("restore only possible peer digits", () => {
    act(() => {
      state.loadGrid(
        "023456789000000000000000000000000000000000000000000000000000000000000000000000000"
      );
    });

    expect(state.cells["A1"].marks[1]).toBe(true);
    for (let i = 2; i <= 9; i++) {
      expect(state.cells["A1"].marks[i]).toBe(false);
    }

    act(() => {
      state.setCellDigit("I1", 9);
      state.setCellDigit("I1", 0);
    });

    expect(state.cells["A1"].marks[1]).toBe(true);
    for (let i = 2; i <= 9; i++) {
      expect(state.cells["A1"].marks[i]).toBe(false);
    }

    act(() => {
      state.setCellDigit("I1", 1);
    });
    for (let i = 1; i <= 9; i++) {
      expect(state.cells["A1"].marks[i]).toBe(false);
    }
  });

  test("don't allow to place digits or marks found in unit", () => {
    act(() => {
      state.loadGrid(
        "010000000000000000000000000000000000000000000000000000000000000000000000000000000"
      );
      state.setCellDigit("A1", 1);
      state.toggleMark("A1", 1);
    });
    expect(state.cells["A1"].digit).toBe(0);
    expect(state.cells["A1"].marks[1]).toBe(false);
  });

  test("try to move out of grid", () => {
    act(() => {
      state.setCurrentCell("A9");
      state.moveCurrentCell("right");
    });
    expect(state.currentCell).toBe("A9");
    act(() => {
      state.moveCurrentCell("up");
    });
    expect(state.currentCell).toBe("A9");

    act(() => {
      state.setCurrentCell("I1");
      state.moveCurrentCell("down");
    });
    expect(state.currentCell).toBe("I1");

    act(() => {
      state.moveCurrentCell("left");
    });
    expect(state.currentCell).toBe("I1");
  });

  test("move to up or left in new grid", () => {
    expect(state.currentCell).toBe("");

    act(() => {
      state.moveCurrentCell("up");
    });
    expect(state.currentCell).toBe("A1");

    act(() => {
      state.loadGrid(
        "010000000000000000000000000000000000000000000000000000000000000000000000000000000"
      );
      state.moveCurrentCell("left");
    });
    expect(state.currentCell).toBe("A1");
  });

  test("move by block", () => {
    act(() => {
      state.setCurrentCell("A1");
      state.moveCurrentCellByBlock("right");
    });
    expect(state.currentCell).toBe("A3");

    act(() => {
      state.moveCurrentCellByBlock("right");
    });
    expect(state.currentCell).toBe("A6");

    act(() => {
      state.moveCurrentCellByBlock("right");
    });
    expect(state.currentCell).toBe("A9");

    act(() => {
      state.moveCurrentCell("left");
      state.moveCurrentCellByBlock("left");
    });
    expect(state.currentCell).toBe("A7");

    act(() => {
      state.moveCurrentCellByBlock("left");
    });
    expect(state.currentCell).toBe("A4");

    act(() => {
      state.moveCurrentCellByBlock("down");
      state.moveCurrentCellByBlock("down");
      state.moveCurrentCellByBlock("up");
    });
    expect(state.currentCell).toBe("D4");
  });

  test("hasSingleSolution", () => {
    function count(state: BoardStore) {
      return (
        C.CELLS.map((pos) => state.cells[pos].digit).reduce(
          (acc, cur) => (cur !== 0 ? acc + 1 : acc),
          0
        ) + 1
      );
    }

    act(() => {
      state.loadGrid(
        "930654102420301609610209040842016090579843216163092004384925761251467938796138425"
      );
    });

    expect(
      hasSingleSolution(structuredClone({ ...state.cells }), count(state))
    ).toBe(false);

    act(() => {
      state.loadGrid(
        "593764821281395040476182935158279364362418579947536182039841250815627493024953018"
      );
    });

    expect(
      hasSingleSolution(structuredClone({ ...state.cells }), count(state))
    ).toBe(false);

    act(() => {
      state.loadGrid(
        "000879163386100729917326458073200896009768315060903274050631947691487532734592681"
      );
    });

    expect(
      hasSingleSolution(structuredClone({ ...state.cells }), count(state))
    ).toBe(false);

    act(() => {
      state.loadGrid(
        "..3.2.6..9..3.5..1..18.64....81.29..7.......8..67.82....26.95..8..2.3..9..5.1.3.."
      );
    });

    expect(
      hasSingleSolution(structuredClone({ ...state.cells }), count(state))
    ).toBe(true);
  });
});
