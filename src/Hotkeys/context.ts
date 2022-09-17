import { createContext, Dispatch } from "react";
import { HotkeyAction } from "./types";

// Separate context from rest of the hotkey code so Vite HMR works!
export const hotkeysDispatchContext = createContext<Dispatch<HotkeyAction>>(
  {} as Dispatch<HotkeyAction>
);
