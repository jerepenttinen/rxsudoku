import "./Hotkeys";
import Board from "./Board";
import HighlightButtons from "./HighlightButtons";

function App() {
  return (
    <div class="h-full min-h-screen dark:bg-gray-900">
      <Board />
      <HighlightButtons />
    </div>
  );
}

export default App;
