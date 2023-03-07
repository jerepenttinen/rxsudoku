import { sudokuMachine } from "./sudoku/sudokuMachine";
import { useMachine } from "@xstate/solid";

const [state, send] = useMachine(sudokuMachine, {
  actions: {
    resetTimer: () => window.dispatchEvent(new Event("resetTimer")),
  },
});

export const sudoku = {
  state,
  send,
};
