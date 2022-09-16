import Board from "@/Board";
import LoadBoard from "./LoadBoard";

function App() {
  return (
    <main className="flex max-h-full min-h-screen flex-col items-center bg-zinc-900">
      <div>
        <LoadBoard />
        <Board />
      </div>
    </main>
  );
}

export default App;
