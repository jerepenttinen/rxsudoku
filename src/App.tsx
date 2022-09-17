import Board from "@/Board";
import LoadBoard from "@/LoadBoard";
import { HotkeyProvider } from "@/Hotkeys";

function App() {
  return (
    <HotkeyProvider>
      <main className="flex max-h-full min-h-screen flex-col items-center bg-zinc-900">
        <div>
          <LoadBoard />
          <Board />
        </div>
      </main>
    </HotkeyProvider>
  );
}

export default App;
