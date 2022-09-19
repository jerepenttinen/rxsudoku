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
      // Destructure hotkeys to trigger rerender
      return { ...hotkeys };
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
  const [hotkeys, dispatch] = useReducer(hotkeyReducer, new Hotkeys());

  const upHandler = useCallback((event: globalThis.KeyboardEvent) => {
    event.preventDefault();
    dispatch({
      type: "removeKey",
      key: event.code,
    } as HotkeyAction);
  }, []);

  const downHandler = useCallback(
    (event: globalThis.KeyboardEvent) => {
      dispatch({
        type: "addKey",
        key: event.code,
      } as HotkeyAction);

      const pressedKeys = Array.from(hotkeys.keys).sort().join("+");
      if (hotkeys.callbacks.has(pressedKeys)) {
        event.preventDefault();
      }
    },
    [hotkeys]
  );

  // cleanup pressed keys when focus regained!
  const focusHandler = useCallback(() => hotkeys.keys.clear(), [hotkeys]);

  useEffect(() => {
    document.addEventListener("keydown", downHandler);
    document.addEventListener("keyup", upHandler);
    window.addEventListener("focus", focusHandler);
    return () => {
      document.removeEventListener("keydown", downHandler);
      document.removeEventListener("keyup", upHandler);
      window.removeEventListener("focus", focusHandler);
    };
  }, []);

  useEffect(() => {
    const pressedKeys = Array.from(hotkeys.keys).sort().join("+");
    const callback = hotkeys.callbacks.get(pressedKeys);
    if (callback !== undefined) {
      callback();
    }
  }, [hotkeys]);

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

  const sortedHotkeys = hotkeys
    .split(",")
    .map((h) => h.split("+").sort().join("+"));

  useEffect(() => {
    sortedHotkeys.forEach((h) => {
      dispatch({
        type: "addCallback",
        key: h,
        callback: callbackRef.current,
      });
    });
  }, []);
}
