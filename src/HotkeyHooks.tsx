import useHotkey from "@/Hotkeys";
import { useBoardStore } from "@/boardStore";
import shallow from "zustand/shallow";

function HotkeyHooks() {
  const [
    setCurrentCellDigit,
    toggleCurrentCellMark,
    moveCurrentCell,
    setHighlightedCandidates,
  ] = useBoardStore(
    (state) => [
      state.setCurrentCellDigit,
      state.toggleCurrentCellMark,
      state.moveCurrentCell,
      state.setHighlightedCandidates,
    ],
    shallow
  );

  useHotkey("Backspace", () => setCurrentCellDigit("0"));
  useHotkey("Delete", () => setCurrentCellDigit("0"));

  for (let i = 1; i <= 9; i++) {
    useHotkey("ControlRight+Digit" + i, () => toggleCurrentCellMark(i));
    useHotkey("ControlLeft+Digit" + i, () => toggleCurrentCellMark(i));
    useHotkey("ShiftRight+Digit" + i, () => setHighlightedCandidates(i));
    useHotkey("ShiftLeft+Digit" + i, () => setHighlightedCandidates(i));
    useHotkey("Digit" + i, () => setCurrentCellDigit(i.toString()));
  }

  useHotkey("ArrowLeft", () => moveCurrentCell("left"));
  useHotkey("ArrowRight", () => moveCurrentCell("right"));
  useHotkey("ArrowUp", () => moveCurrentCell("up"));
  useHotkey("ArrowDown", () => moveCurrentCell("down"));

  return <></>;
}

export default HotkeyHooks;
