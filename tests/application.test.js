import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

test('application initializes and preserves the complete six-chapter flow', async () => {
  const errors = [];
  const originalError = console.error;
  console.error = (...args) => errors.push(args);
  const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const { document, window } = parseHTML(html);
  const media = [];
  class AudioStub extends EventTarget {
    paused = true;
    duration = 120;
    currentTime = 0;
    volume = 1;
    constructor() {
      super();
      media.push(this);
    }
    async play() {
      this.paused = false;
      this.dispatchEvent(new Event('play'));
    }
    pause() {
      this.paused = true;
      this.dispatchEvent(new Event('pause'));
    }
  }
  Object.assign(globalThis, {
    document,
    window,
    Audio: AudioStub,
    matchMedia: () => ({ matches: true }),
  });
  document.querySelectorAll('dialog').forEach((dialog) => {
    dialog.showModal = () => {
      dialog.open = true;
      dialog.setAttribute('open', '');
    };
    dialog.close = () => {
      dialog.open = false;
      dialog.removeAttribute('open');
    };
  });
  document.querySelectorAll('img').forEach((image) => {
    image.complete = true;
  });

  await import('../src/main.js');
  const click = async (selector) => {
    const button = document.querySelector(selector);
    assert.ok(button, selector);
    button.dispatchEvent(new window.Event('click', { bubbles: true }));
    await new Promise((resolve) => setImmediate(resolve));
  };
  assert.equal(document.querySelectorAll('.social-links').length, 1);
  assert.equal(document.querySelectorAll('.music-player').length, 1);
  assert.equal(document.querySelectorAll('.mechanisms').length, 1);
  assert.equal(document.querySelectorAll('.art-stage').length, 6);
  assert.equal(document.querySelectorAll('.mobile-chapter-copy').length, 6);
  assert.match(document.querySelector('.note-copy').textContent, /arquitetura intencional/);

  for (const id of ['solutions', 'engineering', 'portrait', 'hermes', 'thanks', 'mind']) {
    await click(`[data-chapter="${id}"]`);
    const visible = [...document.querySelectorAll('.reference-hero')].filter(
      (chapter) => !chapter.hidden,
    );
    assert.equal(visible.length, 1);
    assert.equal(visible[0].id, id);
    if (id === 'solutions')
      assert.match(
        visible[0].querySelector('.terminal-output').textContent,
        /Desenvolvedor DevOps/,
      );
    if (id === 'engineering')
      assert.match(visible[0].querySelector('.terminal-output').textContent, /Nem toda pausa/);
  }
  await click('[data-manuscript="engineering"]');
  assert.equal(document.querySelector('.manuscript').open, true);
  assert.match(document.querySelector('.manuscript-copy').textContent, /Encaro DevOps/);
  await click('.close-manuscript');
  assert.equal(document.querySelector('.manuscript').open, false);

  await click('[data-profile="projects"]');
  assert.equal(document.querySelector('.profile-dialog').open, true);
  assert.match(document.querySelector('#profile-panel').textContent, /Repositório privado/);
  await click('[data-tab="skills"]');
  assert.match(document.querySelector('#profile-panel').textContent, /Quarkus/);
  assert.equal(document.querySelector('#tab-skills').getAttribute('aria-selected'), 'true');
  assert.equal(document.querySelector('#tab-projects').tabIndex, -1);
  await click('.close-profile');

  media[0].dispatchEvent(new Event('loadedmetadata'));
  assert.equal(media[0].currentTime, 18);
  assert.equal(media[0].paused, false);
  await click('.music-toggle');
  assert.equal(media[0].paused, true);
  await click('.music-toggle');
  assert.equal(media[0].paused, false);
  window.dispatchEvent(new window.Event('pagehide'));
  assert.equal(document.querySelector('.music-player'), null);
  assert.equal(media[0].paused, true);
  console.error = originalError;
  assert.deepEqual(errors, [], 'application should not log runtime errors');
});
