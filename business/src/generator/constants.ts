import { cross } from "./utils";

type Constants = {
  ALLOWED_DIGITS: string;
  ROWS: string[];
  COLS: string[];
  CELLS: string[];
  GROUPLIST: string[][];
  GROUPS: Map<string, string[][]>;
  PEERS: Map<string, Set<string>>;
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

// Column groups A1, B1, C1, ...
C.GROUPLIST = C.COLS.map((c) => cross(C.ROWS, [c]))
  // Row groups A1, A2, A3, ...
  .concat(C.ROWS.map((r) => cross([r], C.COLS)))
  // Block groups A1, A2, A3, B1, B2, B3, ...
  .concat(
    [
      ["A", "B", "C"],
      ["D", "E", "F"],
      ["G", "H", "I"],
    ].flatMap((g) =>
      [
        ["1", "2", "3"],
        ["4", "5", "6"],
        ["7", "8", "9"],
      ].map((i) => cross(g, i))
    )
  );

for (const cell of C.CELLS) {
  // Find rows, columns and blocks that the cell is part of
  const cellGroups = C.GROUPLIST.filter((group) => group.includes(cell));
  C.GROUPS.set(cell, cellGroups);

  // Flatten and deduplicate groups
  const cellPeers = new Set(cellGroups.flat());

  // Delete cell itself from its peers
  cellPeers.delete(cell);
  C.PEERS.set(cell, cellPeers);
}

export default Object.freeze(C);
