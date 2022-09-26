import { useBoardStore } from "@/boardStore";
import shallow from "zustand/shallow";
import Button from "@/Button";
import { range } from "@/utilFuncs";

function HighlightButtons() {
  const [setHighlightedCandidates, highlightedCandidates] = useBoardStore(
    (state) => [state.setHighlightedCandidates, state.highlightedCandidates],
    shallow
  );
  return (
    <div className="my-4 flex select-none flex-row">
      {Array.from(range(1, 10)).map((num, key) => (
        <Button
          key={key}
          className={`rounded-none p-1 ${
            num === highlightedCandidates &&
            "bg-blue-500 hover:bg-blue-400 active:bg-blue-500 dark:bg-blue-500 dark:text-zinc-900 dark:hover:bg-blue-400 dark:active:bg-blue-500"
          }`}
          onClick={() => setHighlightedCandidates(num)}
        >
          {num}
        </Button>
      ))}
    </div>
  );
}

export default HighlightButtons;
