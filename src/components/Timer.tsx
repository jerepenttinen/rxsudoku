import { sudoku } from "../sudoku";

export default function Timer() {
  const { timer } = sudoku.state.context;
  const display = () =>
    new Date(timer.current - timer.started).toISOString().slice(14, 19);

  return (
    <div class="font-mono text-xl text-gray-800 dark:text-white">
      {display()}
    </div>
  );
}
