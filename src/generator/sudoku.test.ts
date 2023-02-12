import { describe, expect, it } from "vitest";
import { load } from "./sudoku";

describe("load grid", () => {
  it("should load grid correctly", () => {
    const grid = load(
      "123..............................................................................",
    );

    expect(grid.cells.A1.digit).toBe(1);
    expect(grid.cells.A2.digit).toBe(2);
    expect(grid.cells.A3.digit).toBe(3);

    expect(grid.cells.I9.marks[1]).toBeTruthy();
    expect(grid.cells.I9.marks[2]).toBeTruthy();
    expect(grid.cells.I9.marks[3]).toBeTruthy();
    expect(grid.cells.I9.marks[4]).toBeTruthy();
    expect(grid.cells.I9.marks[5]).toBeTruthy();
    expect(grid.cells.I9.marks[6]).toBeTruthy();
    expect(grid.cells.I9.marks[7]).toBeTruthy();
    expect(grid.cells.I9.marks[8]).toBeTruthy();
    expect(grid.cells.I9.marks[9]).toBeTruthy();
  });
});
