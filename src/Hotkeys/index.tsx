import {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useReducer,
  useRef,
} from "react";
import { hotkeysDispatchContext } from "./context";
import { HotkeyAction, Hotkeys } from "./types";

function hotkeyReducer(hotkeys: Hotkeys, action: HotkeyAction): Hotkeys {
  switch (action.type) {
    case "removeKey": {
      hotkeys.keys.delete(action.key);
      return hotkeys;
    }
    case "addKey": {
      hotkeys.keys.add(action.key);
      console.log(hotkeys.keys);
      for (const [hotkey, callback] of hotkeys.callbacks) {
        if (
          hotkey
            .split("+")
            .reduce((acc, key) => acc && hotkeys.keys.has(key), true)
        ) {
          callback();
        }
      }
      return hotkeys;
    }
    case "addCallback": {
      hotkeys.callbacks.set(action.key, action.callback);
      return hotkeys;
    }
    default: {
      throw Error("unknown action: " + action.type);
    }
  }
}

export function HotkeyProvider({ children }: { children: JSX.Element }) {
  const [, dispatch] = useReducer(hotkeyReducer, new Hotkeys());

  const downHandler = useCallback((event: globalThis.KeyboardEvent) => {
    event.preventDefault();
    dispatch({
      type: "addKey",
      key: event.key,
    } as HotkeyAction);
  }, []);

  const upHandler = useCallback((event: globalThis.KeyboardEvent) => {
    event.preventDefault();
    dispatch({
      type: "removeKey",
      key: event.key,
    } as HotkeyAction);
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", downHandler);
    document.addEventListener("keyup", upHandler);
    return () => {
      document.removeEventListener("keydown", downHandler);
      document.removeEventListener("keyup", upHandler);
    };
  }, []);

  return (
    <hotkeysDispatchContext.Provider value={dispatch}>
      {children}
    </hotkeysDispatchContext.Provider>
  );
}

export default function useHotkey(hotkeys: string, callback: () => void) {
  const dispatch = useContext(hotkeysDispatchContext);
  const callbackRef = useRef(callback);
  useLayoutEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    dispatch({
      type: "addCallback",
      key: hotkeys,
      callback: callbackRef.current,
    });
  }, []);
}
