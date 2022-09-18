import { useBoardStore } from "@/boardStore";

function DifficultyButton({
  text,
  prefillCount,
}: {
  text: string;
  prefillCount: number;
}) {
  const generateGrid = useBoardStore((state) => state.generateGrid);
  return (
    <>
      <button
        type="button"
        onClick={() => generateGrid(prefillCount)}
        className="rounded-lg border-2 border-transparent bg-zinc-800 p-2 text-zinc-200 hover:border-blue-500 hover:bg-zinc-700 active:bg-zinc-800"
      >
        {text}
      </button>
    </>
  );
}

// 22
function NewGame() {
  return (
    <div className="my-3 flex flex-row gap-3">
      <DifficultyButton text="Easy" prefillCount={34} />
      <DifficultyButton text="Medium" prefillCount={30} />
      <DifficultyButton text="Hard" prefillCount={27} />
      <DifficultyButton text="Very Hard" prefillCount={24} />
    </div>
  );
}

export default NewGame;
