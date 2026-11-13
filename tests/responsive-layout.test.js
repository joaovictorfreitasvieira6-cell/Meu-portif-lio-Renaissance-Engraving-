import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';
import { initResponsiveLayout } from '../src/ui/responsive-layout.js';
import { mobileChapters } from '../src/content/mobile-chapters.js';
import { site } from '../src/config/site.js';

function fixture() {
  const { document } = parseHTML(
    fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8'),
  );
  globalThis.document = document;
  const chapters = site.chapters.map((id) => document.getElementById(id));
  return { document, chapters };
}

test('each chapter gets readable copy and navigation outside the artwork', () => {
  const { document, chapters } = fixture();
  const artwork = document.querySelector('#mind .reference-art');
  initResponsiveLayout({ chapters, content: mobileChapters });
  assert.equal(document.querySelectorAll('.art-stage').length, 6);
  assert.equal(document.querySelectorAll('.mobile-chapter-copy').length, 6);
  chapters.forEach((chapter) => {
    assert.ok(chapter.querySelector('.mobile-chapter-copy h1').textContent.trim());
    assert.equal(chapter.querySelector('.art-stage .chapter-button'), null);
    assert.ok(chapter.querySelector('.chapter-navigation .chapter-button'));
  });
  assert.equal(document.querySelector('#mind .art-stage .reference-art'), artwork);
});

test('Hermes retains its original descriptions in the readable mobile content', () => {
  const { document, chapters } = fixture();
  initResponsiveLayout({ chapters, content: mobileChapters });
  const text = document.querySelector('#hermes .mobile-chapter-copy').textContent;
  assert.match(text, /VPS da Oracle/);
  assert.match(text, /Claude Code e Codex/);
  assert.match(text, /Machine learning/);
  assert.equal(document.querySelectorAll('#hermes .mobile-ai-topics section').length, 4);
});

test('responsive setup is idempotent and cleanup restores desktop nodes and buttons', () => {
  const { document, chapters } = fixture();
  const originals = chapters.map((chapter) => [...chapter.childNodes]);
  const dispose = initResponsiveLayout({ chapters, content: mobileChapters });
  initResponsiveLayout({ chapters, content: mobileChapters });
  assert.equal(document.querySelectorAll('.mobile-chapter-copy').length, 6);
  dispose();
  assert.equal(document.querySelector('.art-stage'), null);
  chapters.forEach((chapter, index) => assert.deepEqual([...chapter.childNodes], originals[index]));
});
