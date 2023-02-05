import useHotkey from "@/Hotkeys";
import { useBoardStore } from "@/boardStore";
import shallow from "zustand/shallow";

function HotkeyHooks() {
  const [
    setCurrentCellDigit,
    toggleCurrentCellMark,
    moveCurrentCell,
    moveCurrentCellByBlock,
    setHighlightedCandidates,
    toggleCurrentCellHighlightedMark,
    toggleCurrentCellHighlightedDigit,
    undo,
  ] = useBoardStore(
    (state) => [
      state.setCurrentCellDigit,
      state.toggleCurrentCellMark,
      state.moveCurrentCell,
      state.moveCurrentCellByBlock,
      state.setHighlightedCandidates,
      state.toggleCurrentCellHighlightedMark,
      state.toggleCurrentCellHighlightedDigit,
      state.undo,
    ],
    shallow
  );

  useHotkey("Backspace,Delete", () => setCurrentCellDigit(0));

  for (let i = 1; i <= 9; i++) {
    useHotkey(`ControlRight+Digit${i},ControlLeft+Digit${i}`, () =>
      toggleCurrentCellMark(i)
    );
    useHotkey(`ShiftRight+Digit${i},ShiftLeft+Digit${i}`, () =>
      setHighlightedCandidates(i)
    );
    useHotkey("Digit" + i, () => setCurrentCellDigit(i));
  }

  useHotkey("ArrowLeft", () => moveCurrentCell("left"));
  useHotkey("ArrowRight", () => moveCurrentCell("right"));
  useHotkey("ArrowUp", () => moveCurrentCell("up"));
  useHotkey("ArrowDown", () => moveCurrentCell("down"));

  useHotkey("ControlRight+ArrowLeft,ControlLeft+ArrowLeft", () =>
    moveCurrentCellByBlock("left")
  );
  useHotkey("ControlRight+ArrowRight,ControlRight+ArrowRight", () =>
    moveCurrentCellByBlock("right")
  );
  useHotkey("ControlRight+ArrowUp,ControlRight+ArrowUp", () =>
    moveCurrentCellByBlock("up")
  );
  useHotkey("ControlRight+ArrowDown,ControlRight+ArrowDown", () =>
    moveCurrentCellByBlock("down")
  );

  useHotkey("KeyT", toggleCurrentCellHighlightedMark);
  useHotkey("KeyF", toggleCurrentCellHighlightedDigit);

  useHotkey("KeyU,ControlRight+KeyZ,ControlLeft+KeyZ", undo);

  return <></>;
}

export default HotkeyHooks;
