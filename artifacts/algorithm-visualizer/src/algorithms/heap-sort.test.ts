import assert from 'node:assert/strict';
import test from 'node:test';

import { generateHeapSortSteps } from './heap-sort';

function replaySteps(input: readonly number[]) {
  const values = [...input];
  const steps = generateHeapSortSteps(input);

  for (const step of steps) {
    if (step.type !== 'heapSwap') continue;
    const [first, second] = step.indices;
    [values[first], values[second]] = [values[second], values[first]];
  }

  return { steps, values };
}

test('Heap Sort builds a heap and sorts by extracting maxima', () => {
  const input = [5, 1, 4, 2, 8, 2];
  const { steps, values } = replaySteps(input);

  assert.deepEqual(values, [1, 2, 2, 4, 5, 8]);
  assert.equal(steps.at(-1)?.type, 'complete');
  assert.ok(steps.some((step) => step.type === 'heapifyStart' && step.phase === 'build'));
  assert.equal(
    steps.filter((step) => step.type === 'heapExtract').length,
    input.length - 1,
  );
});

test('Heap Sort preserves input and emits valid heap indices', () => {
  const input = [3, 3, 1, 7];
  const { steps } = replaySteps(input);

  assert.deepEqual(input, [3, 3, 1, 7]);
  for (const step of steps) {
    if (
      step.type !== 'heapCompare' &&
      step.type !== 'heapSwap'
    ) {
      continue;
    }
    assert.ok(step.indices.every((index) => index >= 0 && index < input.length));
    assert.ok(step.heapSize >= 0 && step.heapSize <= input.length);
  }
});