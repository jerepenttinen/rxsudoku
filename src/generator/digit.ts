/**
 * Bottom 4 bits: digit
 * Bit 5: whether it's a clue
 * Bit 6-14: marks
 * Bit 15-23: mark highlights
 */
const digitMask = 0b1111;
const markMask = 0b111_111_111;

export type Cell = number;

export function createCell(n: number, clue: boolean): Cell {
  n &= digitMask;
  if (clue) {
    n |= 1 << 4;
  }
  return n;
}

export function getDigit(cell: Cell): number {
  return cell & digitMask;
}

export function setDigit(cell: Cell, newDigit: number): Cell {
  return newDigit & digitMask;
}

export function isClue(cell: Cell): boolean {
  return (cell & (1 << 4)) != 0;
}

export function setIsClue(cell: Cell, clue: boolean): Cell {
  cell &= ~(1 << 4);
  if (clue) {
    cell |= 1 << 4;
  }
  return cell;
}

export function isMarked(cell: Cell, mark: number): boolean {
  if (mark === 0) {
    return false;
  }
  return (cell & (1 << (mark - 1 + 5))) != 0;
}

export function getMarks(cell: Cell) {
  return (cell >> 5) & markMask;
}

export function toggleMark(cell: Cell, mark: number): Cell {
  return cell ^ (1 << (mark - 1 + 5));
}

export function isMarkHighlighted(cell: Cell, mark: number): boolean {
  return ((cell >> 14) & (1 << (mark - 1))) != 0;
}

export function toggleMarkHighlight(cell: Cell, mark: number): Cell {
  return cell ^ (1 << (mark - 1 + 14));
}
