import withHotkeys from "./keyboard/withHotkeys";
import Board from "./components/Board";
import ActionButtons from "./components/ActionButtons";
import DifficultyDropdown from "./components/DifficultyDropdown";
import UndoButton from "./components/UndoButton";
import Timer from "./components/Timer";
import WinAlert from "./components/WinAlert";
import ResetGameButton from "./components/ResetGameButton";
import { BrainButton, StrategyAlerts } from "./components/BrainUsers";

function App() {
  return (
    <div class="flex h-full min-h-screen flex-col items-center pt-4 dark:bg-gray-900">
      <div class="flex w-full flex-col gap-4 px-4 md:max-w-screen-sm md:px-0">
        <div class="flex w-full flex-row items-center">
          <div class="flex flex-1 gap-4">
            <UndoButton />
            <BrainButton />
          </div>
          <div class="flex flex-1 justify-center">
            <Timer />
          </div>
          <div class="flex flex-1 flex-row justify-end gap-4">
            <ResetGameButton />
            <DifficultyDropdown />
          </div>
        </div>
        <Board />
        <ActionButtons />
        <WinAlert />
        <StrategyAlerts />
      </div>
    </div>
  );
}

export default withHotkeys(App);
