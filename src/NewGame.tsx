import { useBoardStore } from "@/boardStore";
import Button from "@/Button";

function NewGame() {
  const generateGrid = useBoardStore((state) => state.generateGridCorrect);
  return (
    <div className="my-3 flex flex-row gap-3">
      <Button onClick={() => generateGrid(34)}>Easy</Button>
      <Button onClick={() => generateGrid(30)}>Medium</Button>
      <Button onClick={() => generateGrid(27)}>Hard</Button>
      <Button onClick={() => generateGrid(24)}>Very Hard</Button>
    </div>
  );
}

export default NewGame;
