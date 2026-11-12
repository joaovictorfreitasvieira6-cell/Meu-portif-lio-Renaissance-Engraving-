/** A small scope for event handlers, timers and feature cleanup. */
export function createScope() {
  const cleanups = [];
  return {
    add(cleanup) {
      if (typeof cleanup === 'function') cleanups.push(cleanup);
      return cleanup;
    },
    listen(target, event, handler, options) {
      target.addEventListener(event, handler, options);
      cleanups.push(() => target.removeEventListener(event, handler, options));
    },
    dispose() {
      cleanups
        .splice(0)
        .reverse()
        .forEach((cleanup) => cleanup());
    },
  };
}
