import withHotkeys from "./keyboard/withHotkeys";
import Board from "./components/Board";
import ActionButtons from "./components/ActionButtons";
import DifficultyDropdown from "./components/DifficultyDropdown";
import UndoButton from "./components/UndoButton";
import Timer from "./components/Timer";

function App() {
  return (
    <div class="flex h-full min-h-screen flex-col items-center pt-4 dark:bg-gray-900">
      <div class="flex w-full flex-col gap-4 px-4 md:max-w-screen-sm md:px-0">
        <div class="flex w-full flex-row items-center justify-between">
          <UndoButton />
          <Timer />
          <DifficultyDropdown />
        </div>
        <Board />
        <ActionButtons />
      </div>
    </div>
  );
}

export default withHotkeys(App);
