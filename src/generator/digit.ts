/**
 * Bottom 4 bits: digit
 * Bit 5: whether it's a clue
 * Bits 6-14: marks
 * Bits 15-23: mark highlight remove
 * Bits 24-32: mark highlight remove
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

export function isMarkHighlightedAlt(cell: Cell, mark: number): boolean {
  return ((cell >> 23) & (1 << (mark - 1))) != 0;
}

export function toggleMarkHighlightAlt(cell: Cell, mark: number): Cell {
  return cell ^ (1 << (mark - 1 + 23));
}

export function removeHighlights(cell: Cell): Cell {
  return cell & 0b111111111_1_1111;
}
