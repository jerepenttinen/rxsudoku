import { sudokuMachine } from "@rxsudoku/core";
import { useMachine } from "@xstate/solid";

const [state, send] = useMachine(sudokuMachine);

send("STARTGAME");

export const sudoku = {
  state,
  send,
};
