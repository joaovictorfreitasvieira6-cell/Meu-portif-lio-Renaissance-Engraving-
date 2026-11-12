import test from 'node:test';
import assert from 'node:assert/strict';
import { createAudioController } from '../src/core/audio-controller.js';

class FakeAudio extends EventTarget {
  paused = true;
  duration = 100;
  currentTime = 0;
  volume = 1;
  blocked = false;
  async play() {
    if (this.blocked) throw Error('autoplay denied');
    this.paused = false;
    this.dispatchEvent(new Event('play'));
  }
  pause() {
    this.paused = true;
    this.dispatchEvent(new Event('pause'));
  }
}

function fixture() {
  const audio = new FakeAudio();
  return { audio, controller: createAudioController({ audio, source: 'track.mp4', startAt: 18 }) };
}

test('starts at 18 seconds and repeats from the same point', async () => {
  const { audio, controller } = fixture();
  audio.dispatchEvent(new Event('loadedmetadata'));
  assert.equal(audio.currentTime, 18);
  audio.currentTime = 100;
  audio.dispatchEvent(new Event('ended'));
  assert.equal(audio.currentTime, 18);
  assert.equal(audio.paused, false);
  controller.dispose();
});

test('short media does not seek beyond its duration', () => {
  const { audio } = fixture();
  audio.duration = 5;
  audio.dispatchEvent(new Event('loadedmetadata'));
  assert.equal(audio.currentTime, 0);
});

test('autoplay denial is reported and can recover after user interaction', async () => {
  const { audio, controller } = fixture();
  let state;
  controller.subscribe((value) => {
    state = value;
  });
  audio.blocked = true;
  assert.equal(await controller.play(), false);
  assert.equal(state.blocked, true);
  audio.blocked = false;
  assert.equal(await controller.play(), true);
  assert.equal(state.blocked, false);
});

test('volume stays in range and cleanup removes media listeners', () => {
  const { audio, controller } = fixture();
  controller.setVolume(2);
  assert.equal(audio.volume, 1);
  controller.setVolume(-1);
  assert.equal(audio.volume, 0);
  controller.dispose();
  audio.currentTime = 3;
  audio.dispatchEvent(new Event('ended'));
  assert.equal(audio.currentTime, 3);
  assert.equal(audio.paused, true);
});
