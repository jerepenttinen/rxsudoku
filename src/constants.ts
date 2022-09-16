import { cross } from "@/utilFuncs";

type Constants = {
  ALLOWED_DIGITS: string;
  ROWS: string[];
  COLS: string[];
  CELLS: string[];
  GROUPLIST: string[][];
  GROUPS: Map<string, string[][]>;
  PEERS: Map<string, string[]>;
};

const C: Constants = {
  ALLOWED_DIGITS: "0123456789",
  ROWS: ["A", "B", "C", "D", "E", "F", "G", "H", "I"],
  COLS: ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
  CELLS: [],
  GROUPLIST: [],
  GROUPS: new Map(),
  PEERS: new Map(),
};

C.CELLS = cross(C.ROWS, C.COLS);

export default Object.freeze(C);
