/** Navigation state only. The transition is injected and may be replaced independently. */
export function createChapterRouter({ chapters, transition, onError = console.error }) {
  let current = chapters.find((chapter) => !chapter.hidden) ?? chapters[0];
  let busy = false;
  const listeners = new Set();

  async function navigate(id) {
    const target = chapters.find((chapter) => chapter.id === id);
    if (busy || !target || target === current) return false;
    busy = true;
    const previous = current;
    const index = chapters.indexOf(target);
    const direction = index < chapters.indexOf(previous) ? -1 : 1;

    try {
      const image = target.querySelector('img');
      if (image && !image.complete) await image.decode().catch(() => {});
      await transition.cover({ previous, index, direction });
      chapters.forEach((chapter) => {
        chapter.hidden = chapter !== target;
      });
      current = target;
      listeners.forEach((listener) => listener({ current, previous }));
      await transition.reveal({ current, previous, direction });
      target.querySelector('.chapter-button')?.focus({ preventScroll: true });
      return true;
    } catch (error) {
      onError(error);
      return false;
    } finally {
      transition.reset();
      busy = false;
    }
  }

  return {
    navigate,
    get current() {
      return current;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
