import { makeEventListener } from "@solid-primitives/event-listener";
import { createSignal, onCleanup } from "solid-js";

export default function Timer() {
  const [start, setStart] = createSignal(Date.now());
  const [current, setCurrent] = createSignal(Date.now());

  const passed = () => current() - start();
  const hmm = () => new Date(passed()).toISOString().slice(11, 19);

  makeEventListener(window, "resetTimer", () => setStart(Date.now()));

  const timer = setInterval(() => setCurrent(Date.now()), 1000);
  onCleanup(() => clearInterval(timer));

  return (
    <div class="font-mono text-xl text-gray-800 dark:text-white">{hmm()}</div>
  );
}
