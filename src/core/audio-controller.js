import { createScope } from './disposable.js';

/** Media behavior is independent of its buttons and accepts a real or test audio element. */
export function createAudioController({ audio, source, startAt = 0, volume = 0.2 }) {
  const scope = createScope();
  const listeners = new Set();
  let blocked = false;
  let failed = false;

  function publish() {
    const state = { paused: audio.paused, blocked, failed, volume: audio.volume };
    listeners.forEach((listener) => listener(state));
  }

  function seekToStart() {
    audio.currentTime = Number.isFinite(audio.duration) && audio.duration > startAt ? startAt : 0;
  }

  async function play() {
    try {
      await audio.play();
      blocked = false;
      failed = false;
      publish();
      return true;
    } catch {
      blocked = true;
      publish();
      return false;
    }
  }

  audio.preload = 'none';
  audio.loop = false;
  audio.volume = volume;
  audio.src = source;
  scope.listen(audio, 'loadedmetadata', seekToStart);
  scope.listen(audio, 'ended', () => {
    seekToStart();
    void play();
  });
  scope.listen(audio, 'play', publish);
  scope.listen(audio, 'pause', publish);
  scope.listen(audio, 'error', () => {
    failed = true;
    publish();
  });

  return {
    play,
    pause: () => audio.pause(),
    toggle: () => (audio.paused ? play() : audio.pause()),
    setVolume(value) {
      audio.volume = Math.max(0, Math.min(1, value));
      publish();
    },
    subscribe(listener) {
      listeners.add(listener);
      publish();
      return () => listeners.delete(listener);
    },
    dispose() {
      scope.dispose();
      listeners.clear();
      audio.pause();
    },
  };
}
