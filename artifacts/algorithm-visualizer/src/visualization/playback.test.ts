import assert from 'node:assert/strict';
import test from 'node:test';

import {
  applyVisualizationStep,
  createPlaybackState,
} from './playback';

test('playback applies comparisons without changing values', () => {
  const state = createPlaybackState([3, 1]);
  const next = applyVisualizationStep(state, {
    type: 'compare',
    indices: [0, 1],
  });

  assert.deepEqual(next.values, [3, 1]);
  assert.equal(next.stepIndex, 1);
  assert.equal(next.comparisons, 1);
  assert.equal(next.swaps, 0);
});

test('playback applies swaps and tracks swap counts', () => {
  const state = createPlaybackState([3, 1]);
  const next = applyVisualizationStep(state, {
    type: 'swap',
    indices: [0, 1],
  });

  assert.deepEqual(next.values, [1, 3]);
  assert.equal(next.stepIndex, 1);
  assert.equal(next.swaps, 1);
});

test('playback marks positions and completes the run', () => {
  const state = createPlaybackState([2, 1]);
  const marked = applyVisualizationStep(state, {
    type: 'markSorted',
    index: 1,
  });
  const complete = applyVisualizationStep(marked, {
    type: 'complete',
  });

  assert.deepEqual([...marked.sorted], [1]);
  assert.equal(complete.status, 'complete');
  assert.deepEqual([...complete.sorted], [0, 1]);
});