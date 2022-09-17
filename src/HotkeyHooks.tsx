import useHotkey from "@/Hotkeys";
import { useBoardStore } from "@/boardStore";
import shallow from "zustand/shallow";

function HotkeyHooks() {
  const [setCurrentCellDigit, toggleCurrentCellMark, moveCurrentCell] =
    useBoardStore(
      (state) => [
        state.setCurrentCellDigit,
        state.toggleCurrentCellMark,
        state.moveCurrentCell,
      ],
      shallow
    );

  useHotkey("Backspace", () => setCurrentCellDigit("0"));
  useHotkey("Delete", () => setCurrentCellDigit("0"));

  for (let i = 1; i <= 9; i++) {
    useHotkey("ControlRight+Digit" + i, () => toggleCurrentCellMark(i));
    useHotkey("ControlLeft+Digit" + i, () => toggleCurrentCellMark(i));
    useHotkey("Digit" + i, () => setCurrentCellDigit(i.toString()));
  }

  useHotkey("ArrowLeft", () => moveCurrentCell("left"));
  useHotkey("ArrowRight", () => moveCurrentCell("right"));
  useHotkey("ArrowUp", () => moveCurrentCell("up"));
  useHotkey("ArrowDown", () => moveCurrentCell("down"));

  return <></>;
}

export default HotkeyHooks;
