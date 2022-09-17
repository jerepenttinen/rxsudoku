export type HotkeyAction = {
  type: string;
  key: string;
  callback: () => void;
};

type HotkeysType = {
  keys: Set<string>;
  callbacks: Map<string, () => void>;
};

export class Hotkeys implements HotkeysType {
  keys = new Set<string>();
  callbacks = new Map<string, () => void>();
}
