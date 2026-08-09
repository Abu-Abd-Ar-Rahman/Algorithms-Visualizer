import assert from 'node:assert/strict';
import test from 'node:test';

import { generateQuickSortSteps } from './quick-sort';

function replaySteps(input: readonly number[]) {
  const values = [...input];
  const steps = generateQuickSortSteps(input);

  for (const step of steps) {
    if (step.type !== 'quickSwap') continue;
    const [first, second] = step.indices;
    [values[first], values[second]] = [values[second], values[first]];
  }

  return { steps, values };
}

test('Quick Sort partitions into a sorted array', () => {
  const input = [5, 1, 4, 2, 8, 2];
  const { steps, values } = replaySteps(input);

  assert.deepEqual(values, [1, 2, 2, 4, 5, 8]);
  assert.equal(steps.at(-1)?.type, 'complete');
  assert.ok(steps.some((step) => step.type === 'partitionStart'));
  assert.ok(steps.some((step) => step.type === 'quickCompare'));
});

test('Quick Sort preserves input and emits valid partition indices', () => {
  const input = [3, 3, 1, 7];
  const { steps } = replaySteps(input);

  assert.deepEqual(input, [3, 3, 1, 7]);
  for (const step of steps) {
    if (
      step.type !== 'quickCompare' &&
      step.type !== 'quickSwap'
    ) {
      continue;
    }
    assert.ok(step.indices.every((index) => index >= 0 && index < input.length));
    assert.ok(step.pivotIndex >= step.range[0]);
    assert.ok(step.pivotIndex <= step.range[1]);
  }
});