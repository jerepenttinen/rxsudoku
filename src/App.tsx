import withHotkeys from "./withHotkeys";
import Board from "./Board";
import HighlightButtons from "./HighlightButtons";
import DifficultyButtons from "./DifficultyButtons";

function App() {
  return (
    <div class="flex h-full min-h-screen flex-col items-center gap-4 py-10 dark:bg-gray-900">
      <Board />
      <HighlightButtons />
      <DifficultyButtons />
    </div>
  );
}

export default withHotkeys(App);
