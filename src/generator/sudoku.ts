import { Grid } from "./types";
import Constants from "./constants";
import { difference, range } from "./utils";
import { createCell, getDigit, getMarks, isMarked, toggleMark } from "./digit";

export function initializeGrid(): Grid {
  const result: Grid = {};

  for (const cell of Constants.CELLS) {
    result[cell] = createCell(0, false);
  }

  return result;
}

export function toStringLine(grid: Grid) {
  return Constants.CELLS.map((cell) => getDigit(grid[cell])).join("");
}

export function toMarksBitsets(grid: Grid) {
  return Constants.CELLS.map((cell) => {
    return getMarks(grid[cell]);
  });
}

export function load(from: string): Grid {
  const result = initializeGrid();

  const grid = from
    .replaceAll(".", "0")
    .replaceAll("-", "0")
    .split("")
    .filter((c: string) => Constants.ALLOWED_DIGITS.includes(c))
    .map((n) => parseInt(n));

  if (grid.length !== 81) {
    throw Error("Grid has to be 81 characters long!");
  }

  for (const [i, v] of grid.entries()) {
    result[Constants.CELLS[i]] = createCell(v, v !== 0);
  }

  for (const cellPos of Constants.CELLS) {
    let cell = result[cellPos];
    if (getDigit(cell) !== 0) {
      continue;
    }
    const possibleDigits = difference(digits, getPeerDigits(result, cellPos));

    for (const c of possibleDigits) {
      if (!isMarked(cell, c)) {
        cell = toggleMark(cell, c);
      }
    }
    result[cellPos] = cell;
  }

  return result;
}

const digits = new Set(range(1, 10));

export function getPeerDigits(cells: Grid, cellPos: string) {
  const peers = Constants.PEERS.get(cellPos);
  if (peers === undefined) {
    throw Error(`Cell position ${cellPos} not found from peers!`);
  }
  return new Set(Array.from(peers).map((pos) => getDigit(cells[pos])));
}
