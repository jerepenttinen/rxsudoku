import { describe, expect, it } from "vitest";
import { nextCell, nextCellBySubgrid } from "./movements";

describe("movements", () => {
  it("should move correctly", () => {
    expect(nextCell("A1", "right")).toBe("A2");
    expect(nextCell("A1", "down")).toBe("B1");
    expect(nextCell("D5", "up")).toBe("C5");
  });

  it("should disallow illegal moves", () => {
    expect(nextCell("A1", "left")).toBe("A1");
    expect(nextCell("A1", "up")).toBe("A1");
    expect(nextCell("I5", "down")).toBe("I5");
  });
});

describe("movements by subgrid", () => {
  it("should clamp to edges correctly", () => {
    // Horizontal
    expect(nextCellBySubgrid("A1", "right")).toBe("A3");
    expect(nextCellBySubgrid("A3", "right")).toBe("A6");
    expect(nextCellBySubgrid("A6", "right")).toBe("A9");

    expect(nextCellBySubgrid("A9", "left")).toBe("A7");
    expect(nextCellBySubgrid("A7", "left")).toBe("A4");
    expect(nextCellBySubgrid("A4", "left")).toBe("A1");

    expect(nextCellBySubgrid("A3", "left")).toBe("A1");
    expect(nextCellBySubgrid("A2", "left")).toBe("A1");
    expect(nextCellBySubgrid("A2", "right")).toBe("A3");

    // Vertical
    expect(nextCellBySubgrid("A1", "down")).toBe("C1");
    expect(nextCellBySubgrid("C1", "down")).toBe("F1");
    expect(nextCellBySubgrid("F1", "down")).toBe("I1");

    expect(nextCellBySubgrid("I1", "up")).toBe("G1");
    expect(nextCellBySubgrid("G1", "up")).toBe("D1");
    expect(nextCellBySubgrid("D1", "up")).toBe("A1");

    expect(nextCellBySubgrid("C1", "up")).toBe("A1");
    expect(nextCellBySubgrid("B1", "up")).toBe("A1");
    expect(nextCellBySubgrid("B1", "down")).toBe("C1");
  });

  it("should disallow illegal moves", () => {
    expect(nextCellBySubgrid("A1", "left")).toBe("A1");
    expect(nextCellBySubgrid("A1", "up")).toBe("A1");
    expect(nextCellBySubgrid("I5", "down")).toBe("I5");
  });
});
