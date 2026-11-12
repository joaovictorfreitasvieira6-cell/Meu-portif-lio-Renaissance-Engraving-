import test from 'node:test';
import assert from 'node:assert/strict';
import { createChapterRouter } from '../src/core/chapter-router.js';

function fixture(transitionOverrides = {}) {
  const chapters = ['mind', 'solutions', 'engineering', 'portrait', 'hermes', 'thanks'].map(
    (id, index) => ({
      id,
      hidden: index !== 0,
      focused: false,
      querySelector(selector) {
        return selector === 'img'
          ? null
          : {
              focus: () => {
                this.focused = true;
              },
            };
      },
    }),
  );
  let resets = 0;
  const transition = {
    cover: async () => {},
    reveal: async () => {},
    reset: () => resets++,
    ...transitionOverrides,
  };
  const errors = [];
  return {
    chapters,
    errors,
    router: createChapterRouter({ chapters, transition, onError: (error) => errors.push(error) }),
    get resets() {
      return resets;
    },
  };
}

test('all six chapters are reachable and only one remains visible', async () => {
  const { chapters, router } = fixture();
  for (const chapter of chapters.slice(1).concat(chapters[0])) {
    assert.equal(await router.navigate(chapter.id), true);
    assert.equal(router.current, chapter);
    assert.deepEqual(
      chapters.filter((entry) => !entry.hidden),
      [chapter],
    );
    assert.equal(chapter.focused, true);
  }
});

test('invalid routes and repeated current routes do not transition', async () => {
  const state = fixture();
  assert.equal(await state.router.navigate('missing'), false);
  assert.equal(await state.router.navigate('mind'), false);
  assert.equal(state.resets, 0);
});

test('rapid clicks cannot start overlapping transitions', async () => {
  let finish;
  const state = fixture({
    cover: () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  });
  const first = state.router.navigate('solutions');
  assert.equal(await state.router.navigate('thanks'), false);
  finish();
  assert.equal(await first, true);
  assert.equal(state.router.current.id, 'solutions');
});

test('a failed transition releases the lock and cleans up', async () => {
  let fail = true;
  const state = fixture({
    cover: async () => {
      if (fail) throw Error('animation failed');
    },
  });
  assert.equal(await state.router.navigate('solutions'), false);
  assert.equal(state.resets, 1);
  assert.equal(state.errors.length, 1);
  fail = false;
  assert.equal(await state.router.navigate('solutions'), true);
});

test('subscriptions can be removed', async () => {
  const { router } = fixture();
  let count = 0;
  const unsubscribe = router.subscribe(() => count++);
  await router.navigate('solutions');
  unsubscribe();
  await router.navigate('engineering');
  assert.equal(count, 1);
});
