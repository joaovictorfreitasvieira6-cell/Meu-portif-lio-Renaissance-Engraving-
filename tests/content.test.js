import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { site } from '../src/config/site.js';
import { profileContent } from '../src/content/profile.js';
import { manuscripts } from '../src/content/manuscripts.js';

test('navigation buttons reference registered chapter IDs', () => {
  const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  for (const [, id] of html.matchAll(/data-chapter="([^"]+)"/g))
    assert.ok(site.chapters.includes(id), id);
  for (const id of site.chapters) assert.ok(html.includes(`id="${id}"`), id);
  for (const [, id] of html.matchAll(/data-manuscript="([^"]+)"/g)) assert.ok(manuscripts[id], id);
  for (const [, id] of html.matchAll(/data-profile="([^"]+)"/g)) assert.ok(profileContent[id], id);
});

test('Room Occupancy remains private with no repository link in the portfolio', () => {
  assert.match(profileContent.projects, /Repositório privado/);
  assert.match(profileContent.projects, /fase de testes/);
  assert.doesNotMatch(profileContent.projects, /href="[^"]*Room-Occupancy-System/);
});
