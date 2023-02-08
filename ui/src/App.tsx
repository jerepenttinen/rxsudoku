import "./Hotkeys";
import Board from "./Board";
import HighlightButtons from "./HighlightButtons";

function App() {
  return (
    <div class="flex h-full min-h-screen flex-col items-center py-12 dark:bg-gray-900">
      <Board />
      <HighlightButtons />
    </div>
  );
}

export default App;
