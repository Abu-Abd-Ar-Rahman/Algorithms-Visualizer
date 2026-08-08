import assert from 'node:assert/strict';
import test from 'node:test';

import { generateBubbleSortSteps } from './bubble-sort';
import type { VisualizationStep } from './types';

function replaySteps(
  input: readonly number[],
  steps: readonly VisualizationStep[],
): number[] {
  const values = [...input];

  for (const step of steps) {
    if (step.type !== 'swap') {
      continue;
    }

    const [firstIndex, secondIndex] = step.indices;
    [values[firstIndex], values[secondIndex]] = [
      values[secondIndex],
      values[firstIndex],
    ];
  }

  return values;
}

test('Bubble Sort generates steps that sort the input', () => {
  const input = [5, 1, 4, 2, 8];
  const steps = generateBubbleSortSteps(input);

  assert.deepEqual(replaySteps(input, steps), [1, 2, 4, 5, 8]);
  assert.deepEqual(input, [5, 1, 4, 2, 8]);
  assert.equal(steps.at(-1)?.type, 'complete');
});

test('Bubble Sort handles empty, single-value, and duplicate arrays', () => {
  assert.equal(
    generateBubbleSortSteps([]).at(-1)?.type,
    'complete',
  );
  assert.deepEqual(
    replaySteps([7], generateBubbleSortSteps([7])),
    [7],
  );
  assert.deepEqual(
    replaySteps(
      [3, 1, 3, 2],
      generateBubbleSortSteps([3, 1, 3, 2]),
    ),
    [1, 2, 3, 3],
  );
});

test('Bubble Sort exits early when the input is already sorted', () => {
  const steps = generateBubbleSortSteps([1, 2, 3, 4]);

  assert.equal(
    steps.filter((step) => step.type === 'compare').length,
    3,
  );
  assert.equal(
    steps.filter((step) => step.type === 'swap').length,
    0,
  );
});

test('Bubble Sort emits valid indices for every indexed step', () => {
  const steps = generateBubbleSortSteps([4, 2, 3, 1]);

  for (const step of steps) {
    if (step.type === 'compare' || step.type === 'swap') {
      assert.equal(step.indices.length, 2);
      assert.ok(step.indices.every((index) => index >= 0 && index < 4));
    }

    if (step.type === 'markSorted') {
      assert.ok(step.index >= 0 && step.index < 4);
    }
  }
});