import withHotkeys from "./withHotkeys";
import Board from "./Board";
import HighlightButtons from "./HighlightButtons";
import init, { generate_grid } from "wasm";

function App() {
  init().then(() => {
    console.log(generate_grid());
  });

  return (
    <div class="flex h-full min-h-screen flex-col items-center py-12 dark:bg-gray-900">
      <Board />
      <HighlightButtons />
    </div>
  );
}

export default withHotkeys(App);
