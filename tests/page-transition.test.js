import test from 'node:test';
import assert from 'node:assert/strict';
import { createPageTransition } from '../src/ui/page-transition.js';

function element() {
  const animations = [];
  const label = { innerHTML: '' };
  return {
    animations,
    label,
    style: {},
    querySelector: () => label,
    getAnimations: () => animations,
    animate(frames, options) {
      const animation = {
        frames,
        options,
        cancelled: false,
        finished: Promise.resolve(),
        cancel() {
          this.cancelled = true;
        },
      };
      animations.push(animation);
      return animation;
    },
  };
}

test('parchment transition animates both phases and cleans up', async () => {
  const curtain = element();
  const previous = element();
  const current = element();
  const classes = new Set();
  const body = {
    classList: { add: (value) => classes.add(value), remove: (value) => classes.delete(value) },
  };
  const transition = createPageTransition({ curtain, body, reducedMotion: { matches: false } });
  await transition.cover({ previous, index: 5, direction: 1 });
  assert.equal(curtain.style.visibility, 'visible');
  assert.match(curtain.label.innerHTML, /VI/);
  await transition.reveal({ current, previous, direction: 1 });
  assert.equal(curtain.animations.length, 2);
  assert.equal(current.animations.length, 1);
  transition.reset();
  assert.equal(curtain.style.visibility, 'hidden');
  assert.equal(classes.size, 0);
  assert.ok(curtain.animations.every((animation) => animation.cancelled));
});

test('reduced motion does not invoke animation APIs', async () => {
  const curtain = { style: {} };
  const body = { classList: { add() {}, remove() {} } };
  const transition = createPageTransition({ curtain, body, reducedMotion: { matches: true } });
  await transition.cover({ previous: {}, index: 0, direction: 1 });
  await transition.reveal({ current: {}, previous: {}, direction: 1 });
  transition.reset();
  assert.equal(curtain.style.visibility, 'hidden');
});
