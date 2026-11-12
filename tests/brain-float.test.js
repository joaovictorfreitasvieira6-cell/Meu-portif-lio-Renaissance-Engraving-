import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { initBrainFloat } from '../src/features/brain-float.js';

test('floating brain reuses the original artwork and removes its mask on cleanup', () => {
  const { document, window } = parseHTML(
    '<section id="mind"><img class="reference-art" src="assets/brain.png"></section>',
  );
  globalThis.document = document;
  assert.equal(initBrainFloat({ reducedMotion: { matches: true } }), undefined);
  assert.equal(document.querySelector('.floating-brain'), null);
  const dispose = initBrainFloat({ reducedMotion: { matches: false } });
  const image = document.querySelector('.floating-brain image');
  assert.equal(image.getAttribute('href'), 'assets/brain.png');
  image.dispatchEvent(new window.Event('load'));
  assert.equal(document.getElementById('mind').classList.contains('brain-float-enabled'), true);
  dispose();
  assert.equal(document.querySelector('.floating-brain'), null);
  assert.equal(document.getElementById('mind').classList.contains('brain-float-enabled'), false);
});
