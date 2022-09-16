import Board from "@/Board";
import LoadBoard from "./LoadBoard";


function App() {
  return (
    <main className="flex flex-col items-center max-h-full min-h-screen bg-zinc-900">
      <div>
        <LoadBoard />
        <Board />
      </div>
    </main>
  );
}

export default App;
