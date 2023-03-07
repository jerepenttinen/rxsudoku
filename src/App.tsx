import withHotkeys from "./keyboard/withHotkeys";
import Board from "./components/Board";
import HighlightButtons from "./components/HighlightButtons";
import DifficultyButtons from "./components/DifficultyButtons";

function App() {
  return (
    <div class="flex h-full min-h-screen flex-col items-center pt-4 dark:bg-gray-900">
      <div class="flex w-full flex-col gap-4 md:max-w-screen-md">
        <div class="flex flex-row justify-between">
          <div></div>
          <DifficultyButtons />
        </div>
        <Board />
        <HighlightButtons />
      </div>
    </div>
  );
}

export default withHotkeys(App);
