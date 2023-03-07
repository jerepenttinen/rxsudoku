import withHotkeys from "./keyboard/withHotkeys";
import Board from "./components/Board";
import ActionButtons from "./components/ActionButtons";
import DifficultyDropdown from "./components/DifficultyDropdown";

function App() {
  return (
    <div class="flex h-full min-h-screen flex-col items-center pt-4 dark:bg-gray-900">
      <div class="flex w-full flex-col gap-4 px-4 md:max-w-screen-sm md:px-0">
        <div class="flex flex-row justify-between">
          <div></div>
          <DifficultyDropdown />
        </div>
        <Board />
        <ActionButtons />
      </div>
    </div>
  );
}

export default withHotkeys(App);
