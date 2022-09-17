import useHotkey from "@/Hotkeys";
import { useBoardStore } from "@/boardStore";
import shallow from "zustand/shallow";

function HotkeyHooks() {
  const [removeCurrentCellDigit] = useBoardStore(
    (state) => [state.removeCurrentCellDigit],
    shallow
  );

  useHotkey("Backspace", removeCurrentCellDigit);
  return <></>;
}

export default HotkeyHooks;
