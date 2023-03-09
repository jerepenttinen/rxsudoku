import { Cells, Grid, emptyMarks } from "./types";
import Constants from "./constants";
import { difference, range, shuffled } from "./utils";

export function initializeGrid(): Grid {
  const result: Grid = {
    cells: {},
    prefilled: new Set(),
  };

  for (const cell of Constants.CELLS) {
    result.cells[cell] = {
      digit: 0,
      marks: emptyMarks(),
    };
  }

  return result;
}

export function toStringLine(grid: Grid) {
  return Constants.CELLS.map((cell) => grid.cells[cell].digit).join("");
}

export function toMarksBitsets(grid: Grid) {
  return Constants.CELLS.map((cell) => {
    const marks = grid.cells[cell].marks;
    let result = 0;
    for (let i = 1; i <= 9; i++) {
      if (marks[i]) {
        result |= 1 << i;
      }
    }
    return result;
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
    result.cells[Constants.CELLS[i]] = {
      digit: v,
      marks: emptyMarks(),
    };
  }

  for (const cellPos of Constants.CELLS) {
    const cell = result.cells[cellPos];
    if (cell.digit !== 0) {
      result.prefilled.add(cellPos);
    }
  }
  markUnfilledCells(result.cells);

  return result;
}

export function generate(prefillCount: number): Grid {
  const result = initializeGrid();
  generateGrid(result.cells);

  removeDigitsFromGrid(result.cells, prefillCount);
  for (const cellPos of Constants.CELLS) {
    const cell = result.cells[cellPos];
    if (cell.digit !== 0) {
      result.prefilled.add(cellPos);
    }
  }

  markUnfilledCells(result.cells);

  return result;
}

export function generateGrid(grid: Cells): boolean {
  const digits = new Set(range(1, 10));
  let cellPos = "";
  for (cellPos of Constants.CELLS) {
    if (grid[cellPos].digit === 0) {
      const peer = Constants.PEERS.get(cellPos);
      if (peer === undefined) {
        continue;
      }

      const peerDigits = new Set(
        Array.from(peer).map((pos) => grid[pos].digit),
      );

      const possibleDigits = shuffled(
        Array.from(difference(digits, peerDigits)),
      );

      for (const digit of possibleDigits) {
        grid[cellPos].digit = digit;
        if (
          Constants.CELLS.map((pos) => grid[pos].digit).every(
            (digit) => digit != 0,
          ) ||
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
  const filledCells = shuffled(structuredClone(Constants.CELLS) as string[]);
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
  filledCellsCount: number,
): boolean {
  let solutionCount = 0;
  const emptyCells = Constants.CELLS.filter((pos) => grid[pos].digit === 0);
  const possibleDigits = new Map<string, Set<number>>();
  for (const cell of emptyCells) {
    const peers = Constants.PEERS.get(cell);
    if (peers === undefined) {
      continue;
    }

    const peerDigits = new Set(Array.from(peers).map((pos) => grid[pos].digit));

    possibleDigits.set(cell, difference(digits, peerDigits));
  }

  emptyCells.sort(
    (a, b) => possibleDigits.get(a)!.size - possibleDigits.get(b)!.size,
  );

  const solver = (grid: Cells, depth: number): boolean => {
    for (const cellPos of emptyCells) {
      if (grid[cellPos].digit !== 0) {
        continue;
      }

      const peers = Constants.PEERS.get(cellPos);
      if (peers === undefined) {
        continue;
      }

      const peerDigits = new Set(
        Array.from(peers).map((pos) => grid[pos].digit),
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

function markUnfilledCells(cells: Cells) {
  for (const cellPos of Constants.CELLS) {
    const cell = cells[cellPos];
    if (cell.digit !== 0) {
      continue;
    }
    const possibleDigits = difference(digits, getPeerDigits(cells, cellPos));

    for (const c of possibleDigits) {
      cell.marks[c] = true;
    }
  }
}

export function getPeerDigits(cells: Cells, cellPos: string) {
  const peers = Constants.PEERS.get(cellPos);
  if (peers === undefined) {
    throw Error(`Cell position ${cellPos} not found from peers!`);
  }
  return new Set(Array.from(peers).map((pos) => cells[pos].digit));
}
