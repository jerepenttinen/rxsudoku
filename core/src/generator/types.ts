export type Marks = {
  [cell: number]: boolean;
};

export function emptyMarks(): Marks {
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

export type Cells = {
  [cell: string]: {
    digit: number;
    marks: Marks;
  };
};

export type Grid = {
  cells: Cells;
  highlighted: Set<string>;
  prefilled: Set<string>;
};
