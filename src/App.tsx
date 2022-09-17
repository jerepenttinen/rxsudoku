import Board from "@/Board";
import LoadBoard from "@/LoadBoard";
import { HotkeyProvider } from "@/Hotkeys";
import HotkeyHooks from "@/HotkeyHooks";

function App() {
  return (
    <HotkeyProvider>
      <main className="flex max-h-full min-h-screen flex-col items-center bg-zinc-100 dark:bg-zinc-900">
        <HotkeyHooks />
        <LoadBoard />
        <Board />
      </main>
    </HotkeyProvider>
  );
}

export default App;
