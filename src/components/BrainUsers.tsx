import constants from "../generator/constants";
import { toMarksBitsets, toStringLine } from "../generator/sudoku";
import { sudoku } from "../sudoku";
import { give_tip } from "../sudoku/aivot";
import { createEffect, createSignal, For, JSX, onCleanup } from "solid-js";
import {
  Toast,
  Toaster,
  Transition,
  ToasterStore,
  useToaster,
} from "solid-headless";
import { IoClose } from "solid-icons/io";
import { megaBrain } from "../generator/utils";

function toCellName(u: Uint32Array) {
  return [...u].map((cell) => constants.CELLS[cell]);
}

export function BrainButton() {
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
          case "NakedSingles":
          case "HiddenSingles": {
            const data = tip.single!;
            const cell = constants.CELLS[data.cell];
            sudoku.send({
              type: "SETCURSOR",
              cell,
            });

            sudoku.send({
              type: "HIGHLIGHT",
              digit: data.digit,
            });

            notifications.create(`Put ${data.digit} here (${tip.strategy})`);
            break;
          }
          case "LockedCandidates": {
            const data = tip.locked_candidate!;
            const cells = toCellName(data.conflict_cells);
            const positions = toCellName(data.positions);

            sudoku.send({
              type: "HIGHLIGHTMARKS",
              conflicts: cells.map((cell) => ({
                cell,
                mark: data.digit,
              })),
              setting: positions.map((cell) => ({
                cell,
                mark: data.digit,
              })),
            });
            sudoku.send({
              type: "HIGHLIGHT",
              digit: data.digit,
            });
            sudoku.send({
              type: "SETCURSOR",
              cell: cells[0],
            });

            notifications.create(
              `Eliminate candidate ${data.digit} from cells ${cells.join(
                ", ",
              )} (${tip.strategy})`,
            );
            break;
          }
          case "NakedPairs":
          case "NakedTriples":
          case "NakedQuads":
          case "HiddenPairs":
          case "HiddenTriples":
          case "HiddenQuads": {
            const data = tip.subset!;
            const conflict_cells = toCellName(data.conflict_cells);
            const conflict_digits = [...data.conflict_digits];
            console.assert(
              conflict_cells.length === conflict_digits.length,
              "not the same length",
            );
            const marks = new Array<{ cell: string; mark: number }>(
              conflict_cells.length,
            );
            for (let i = 0; i < conflict_cells.length; i++) {
              marks[i] = {
                cell: conflict_cells[i],
                mark: conflict_digits[i],
              };
            }

            const cells = toCellName(data.positions);
            const digits = [...data.digits];

            const setting = new Array<{ cell: string; mark: number }>(
              digits.length * cells.length,
            );
            for (let i = 0; i < cells.length; i++) {
              for (let j = 0; j < digits.length; j++) {
                setting[i * cells.length + j] = {
                  cell: cells[i],
                  mark: digits[j],
                };
              }
            }
            sudoku.send({
              type: "HIGHLIGHTMARKS",
              conflicts: marks,
              setting,
            });
            sudoku.send({
              type: "HIGHLIGHT",
              digit: marks[0].mark,
            });
            sudoku.send({
              type: "SETCURSOR",
              cell: conflict_cells[0],
            });

            notifications.create(
              `Eliminate candidates ${marks
                .map((m) => `${m.cell}: ${m.mark}`)
                .join(", ")} (${tip.strategy})`,
            );

            break;
          }
          case "XWing":
          case "Swordfish": {
            const data = tip.fish!;

            const conflict_cells = toCellName(data.conflict_cells);
            const conflict_digits = [...data.conflict_digits];
            console.assert(
              conflict_cells.length === conflict_digits.length,
              "not the same length",
            );
            const marks = new Array<{ cell: string; mark: number }>(
              conflict_cells.length,
            );
            for (let i = 0; i < conflict_cells.length; i++) {
              marks[i] = {
                cell: conflict_cells[i],
                mark: conflict_digits[i],
              };
            }

            data.positions = megaBrain(data.positions);

            let cells = toCellName(data.positions);

            const setting = new Array<{ cell: string; mark: number }>(
              data.positions.length,
            );
            for (let i = 0; i < setting.length; i++) {
              setting[i] = {
                cell: cells[i],
                mark: data.digit,
              };
            }

            sudoku.send({
              type: "HIGHLIGHTMARKS",
              conflicts: marks,
              setting,
            });
            sudoku.send({
              type: "HIGHLIGHT",
              digit: data.digit,
            });
            sudoku.send({
              type: "SETCURSOR",
              cell: conflict_cells[0],
            });

            notifications.create(
              `Eliminate candidate ${
                data.digit
              } from cells ${conflict_cells.join(", ")} (${tip.strategy})`,
            );

            break;
          }
          default:
            notifications.create(tip.strategy);
        }
      }}
    >
      🧠
    </button>
  );
}

const notifications = new ToasterStore<string>();

type ToastProps = {
  id: string;
  message: string;
};

function CustomToast(props: ToastProps): JSX.Element {
  const [isOpen, setIsOpen] = createSignal(true);

  function dismiss() {
    setIsOpen(false);
  }

  return (
    <Transition
      show={isOpen()}
      class="relative rounded-lg bg-blue-900 bg-opacity-25 p-4 transition"
      enter="ease-out duration-300"
      enterFrom="opacity-0 scale-50"
      enterTo="opacity-100 scale-100"
      leave="ease-in duration-200"
      leaveFrom="opacity-100 scale-100"
      leaveTo="opacity-0 scale-50"
      afterLeave={() => {
        notifications.remove(props.id);
      }}
    >
      <Toast class="flex items-center justify-between">
        <span class="flex-1 text-sm font-semibold text-white">
          {props.message}
        </span>
        <button
          type="button"
          class="h-6 w-6 flex-none rounded-full bg-blue-900 bg-opacity-25 p-1 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
          onClick={dismiss}
        >
          <IoClose />
        </button>
      </Toast>
    </Transition>
  );
}

export function StrategyAlerts() {
  const notifs = useToaster(notifications);

  const [isOpen, setIsOpen] = createSignal(false);

  function closeNotifs() {
    setIsOpen(false);
  }

  function clearNotifs() {
    notifications.clear();
  }

  createEffect(() => {
    if (notifs().length > 0) {
      setIsOpen(true);
    }

    const timeout = setTimeout(() => {
      closeNotifs();
    }, 5000);

    onCleanup(() => {
      clearTimeout(timeout);
    });
  });

  return (
    <Toaster class="fixed-0 absolute left-0 bottom-0 z-50 m-4">
      <Transition
        show={isOpen()}
        class="relative transition"
        enter="ease-out duration-300"
        enterFrom="opacity-0 scale-50 translate-y-full"
        enterTo="opacity-100 scale-100 translate-y-0"
        leave="ease-in duration-200"
        leaveFrom="opacity-100 scale-100 translate-y-0"
        leaveTo="opacity-0 scale-50  translate-y-full"
        afterLeave={clearNotifs}
      >
        <div class="flex flex-1 flex-col-reverse space-y-1 space-y-reverse overflow-y-auto rounded-lg">
          <For each={notifs().slice(0).reverse()}>
            {(item) => <CustomToast id={item.id} message={item.data} />}
          </For>
        </div>
      </Transition>
    </Toaster>
  );
}
