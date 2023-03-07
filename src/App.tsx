import withHotkeys from "./keyboard/withHotkeys";
import Board from "./components/Board";
import HighlightButtons from "./components/HighlightButtons";
import DifficultyButtons from "./components/DifficultyButtons";

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
