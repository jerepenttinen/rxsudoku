import useHotkey from "@/Hotkeys";
import { useBoardStore } from "@/boardStore";
import shallow from "zustand/shallow";

function HotkeyHooks() {
  const [
    setCurrentCellDigit,
    toggleCurrentCellMark,
    moveCurrentCell,
    setHighlightedCandidates,
    toggleCurrentCellHighlightedMark,
    toggleCurrentCellHighlightedDigit,
  ] = useBoardStore(
    (state) => [
      state.setCurrentCellDigit,
      state.toggleCurrentCellMark,
      state.moveCurrentCell,
      state.setHighlightedCandidates,
      state.toggleCurrentCellHighlightedMark,
      state.toggleCurrentCellHighlightedDigit,
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

  useHotkey("KeyT", toggleCurrentCellHighlightedMark);
  useHotkey("KeyF", toggleCurrentCellHighlightedDigit);

  return <></>;
}

export default HotkeyHooks;
