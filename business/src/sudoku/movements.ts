import { clamp } from "../generator/utils";

export function nextCell(currentCell: string, direction: string) {
  const [row, col] = currentCell.split("");
  const colNum = Number.parseInt(col);
  function toCell(row: string, col: string | number) {
    return row + col;
  }

  switch (direction) {
    case "left":
      if (colNum > 1) {
        return toCell(row, colNum - 1);
      }
      break;
    case "right":
      if (colNum < 9) {
        return toCell(row, colNum + 1);
      }
      break;
    case "up":
      if (row > "A") {
        return toCell(String.fromCharCode(row.charCodeAt(0) - 1), col);
      }
      break;
    case "down":
      if (row < "I") {
        return toCell(String.fromCharCode(row.charCodeAt(0) + 1), col);
      }
      break;
  }
  return currentCell;
}

export function nextCellBySubgrid(currentCell: string, direction: string) {
  const [row, col] = currentCell.split("");
  const colNum = Number.parseInt(col);
  const ACharCode = "A".charCodeAt(0);
  const rowNum = row.charCodeAt(0) - ACharCode + 1;

  function next(row: number, col: number) {
    return (
      clamp("A", String.fromCharCode(row - 1 + ACharCode), "I") +
      clamp(1, col, 9)
    );
  }

  // outwards from the top/left
  function byBlock(num: number, outwards: boolean): number {
    let distanceFromEdge = (num - 1) % 3;
    if (outwards) {
      distanceFromEdge = 2 - distanceFromEdge;
    }
    const nextBlock = distanceFromEdge === 0 ? 3 : 0;

    return outwards
      ? num + distanceFromEdge + nextBlock
      : num - distanceFromEdge - nextBlock;
  }

  switch (direction) {
    case "left":
      return next(rowNum, byBlock(colNum, false));
    case "right":
      return next(rowNum, byBlock(colNum, true));
    case "up":
      return next(byBlock(rowNum, false), colNum);
    case "down":
      return next(byBlock(rowNum, true), colNum);
  }

  return "A1";
}
