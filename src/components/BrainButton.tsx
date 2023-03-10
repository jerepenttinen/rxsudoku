import constants from "../generator/constants";
import { toMarksBitsets, toStringLine } from "../generator/sudoku";
import { sudoku } from "../sudoku";
import { give_tip } from "../sudoku/aivot";

function toCellName(u: Uint32Array) {
  return [...u].map((cell) => constants.CELLS[cell]);
}

export default function BrainButton() {
  const { context } = sudoku.state;
  return (
    <button
      class="inline-flex h-10 items-center rounded-lg bg-blue-700 px-4 py-2.5 text-center text-lg font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:dark:bg-gray-500"
      onClick={() => {
        const tip = give_tip(
          toStringLine(context.grid),
          new Int32Array(toMarksBitsets(context.grid)),
        );
        switch (tip.strategy) {
          case "NakedSingles": {
            const data = tip.naked_single!;
            const cell = constants.CELLS[data.cell];
            sudoku.send({
              type: "SETCURSOR",
              cell,
            });

            sudoku.send({
              type: "SETCELL",
              cell,
              digit: data.digit,
            });
            break;
          }
          case "HiddenSingles": {
            const data = tip.hidden_single!;
            const cell = constants.CELLS[data.cell];
            sudoku.send({
              type: "SETCURSOR",
              cell,
            });

            sudoku.send({
              type: "SETCELL",
              cell,
              digit: data.digit,
            });
            break;
          }
          case "LockedCandidates": {
            const data = tip.locked_candidate!;
            const cells = [...data.conflict_cells].map(
              (cell) => constants.CELLS[cell],
            );
            console.log(data.digit, cells);

            for (const cell of cells) {
              sudoku.send({
                type: "TOGGLEMARK",
                cell,
                mark: data.digit,
              });
            }
            break;
          }
          case "NakedPairs":
          case "NakedTriples":
          case "NakedQuads":
          case "HiddenPairs":
          case "HiddenTriples":
          case "HiddenQuads": {
            const data = tip.subset!;
            console.log(
              toCellName(data.conflict_cells),
              data.conflict_digits,
              data.digits,
              toCellName(data.positions),
            );
            console.log(tip.strategy);
            break;
          }
          case "XWing":
          case "Swordfish":
          case "Jellyfish": {
            const data = tip.fish!;
            // with XWing data.positions are 2 corners of the XWing tl and br
            console.log(
              data.is_row,
              data.digit,
              toCellName(data.positions),
              data.conflict_digits,
              toCellName(data.conflict_cells),
            );
            console.log(tip.strategy);
            break;
          }
          default:
            console.log(tip.strategy);
        }
      }}
    >
      🧠
    </button>
  );
}
