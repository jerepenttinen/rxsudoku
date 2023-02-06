export function subscribe(
  eventName: string,
  listener: EventListenerOrEventListenerObject
) {
  document.addEventListener(eventName, listener);
}

export function unsubscribe(
  eventName: string,
  listener: EventListenerOrEventListenerObject
) {
  document.removeEventListener(eventName, listener);
}

export function broadcast(eventName: string, data: string) {
  document.dispatchEvent(new CustomEvent(eventName, { detail: data }));
}
