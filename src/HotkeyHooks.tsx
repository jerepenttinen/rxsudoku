import useHotkey from "@/Hotkeys";
import { useBoardStore } from "@/boardStore";
import shallow from "zustand/shallow";

function HotkeyHooks() {
  const [setCurrentCellDigit] = useBoardStore(
    (state) => [state.setCurrentCellDigit],
    shallow
  );

  useHotkey("Backspace", () => setCurrentCellDigit("0"));
  useHotkey("Delete", () => setCurrentCellDigit("0"));
  useHotkey("1", () => setCurrentCellDigit("1"));
  useHotkey("2", () => setCurrentCellDigit("2"));
  useHotkey("3", () => setCurrentCellDigit("3"));
  useHotkey("4", () => setCurrentCellDigit("4"));
  useHotkey("5", () => setCurrentCellDigit("5"));
  useHotkey("6", () => setCurrentCellDigit("6"));
  useHotkey("7", () => setCurrentCellDigit("7"));
  useHotkey("8", () => setCurrentCellDigit("8"));
  useHotkey("9", () => setCurrentCellDigit("9"));
  return <></>;
}

export default HotkeyHooks;
