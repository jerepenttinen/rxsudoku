import withHotkeys from "./withHotkeys";
import Board from "./Board";
import HighlightButtons from "./HighlightButtons";
import init, { generate_grid } from "wasm";

function App() {
  init().then(() => {
    const grid = generate_grid();
    console.log(grid.difficulty, grid.grid);
    grid.free();
  });

  return (
    <div class="flex h-full min-h-screen flex-col items-center py-12 dark:bg-gray-900">
      <Board />
      <HighlightButtons />
    </div>
  );
}

export default withHotkeys(App);
