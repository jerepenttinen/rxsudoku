import Board from "@/Board";
import { HotkeyProvider } from "@/Hotkeys";
import HotkeyHooks from "@/HotkeyHooks";
import NewGame from "@/NewGame";
import HighlightButtons from "@/HighlightButtons";

function App() {
  return (
    <HotkeyProvider>
      <main className="flex max-h-full min-h-screen flex-col items-center bg-zinc-100 dark:bg-zinc-900">
        <HotkeyHooks />
        <NewGame />
        <Board />
        <HighlightButtons />
      </main>
    </HotkeyProvider>
  );
}

export default App;
