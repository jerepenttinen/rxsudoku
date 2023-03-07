import withHotkeys from "./withHotkeys";
import Board from "./Board";
import HighlightButtons from "./HighlightButtons";
import DifficultyButtons from "./DifficultyButtons";

function App() {
  return (
    <div class="flex h-full min-h-screen flex-col items-center py-10 dark:bg-gray-900">
      <div class="flex w-full flex-col md:max-w-screen-md">
        <DifficultyButtons />
        <Board />
        <HighlightButtons />
      </div>
    </div>
  );
}

export default withHotkeys(App);
