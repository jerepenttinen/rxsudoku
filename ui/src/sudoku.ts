import { sudokuMachine } from "@rxsudoku/core";
import { useMachine } from "@xstate/solid";

const [state, send] = useMachine(sudokuMachine);

export const sudoku = {
  state,
  send,
};
