import { sudokuMachine } from "./sudoku/sudokuMachine";
import { useMachine } from "@xstate/solid";

const [state, send] = useMachine(sudokuMachine);

export const sudoku = {
  state,
  send,
};
