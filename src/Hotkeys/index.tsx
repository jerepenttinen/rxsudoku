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

  const keyHandler = (type: string) =>
    useCallback((event: globalThis.KeyboardEvent) => {
      event.preventDefault();
      dispatch({
        type: type,
        key: event.code,
      } as HotkeyAction);
    }, []);

  const downHandler = keyHandler("addKey");
  const upHandler = keyHandler("removeKey");

  useEffect(() => {
    document.addEventListener("keydown", downHandler);
    document.addEventListener("keyup", upHandler);
    return () => {
      document.removeEventListener("keydown", downHandler);
      document.removeEventListener("keyup", upHandler);
    };
  }, []);

  useEffect(() => {
    for (const [hotkey, callback] of hotkeys.callbacks) {
      if (hotkey.split("+").every((key) => hotkeys.keys.has(key))) {
        callback();
        // Hack! Figure a better way to do overlapping hotkeys! e.g. Shift+A and A
        break;
      }
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

  useEffect(() => {
    dispatch({
      type: "addCallback",
      key: hotkeys,
      callback: callbackRef.current,
    });
  }, []);
}
