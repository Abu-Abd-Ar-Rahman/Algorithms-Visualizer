import type { VisualizationStep } from './types';

export function generateBubbleSortSteps(
  values: readonly number[],
): VisualizationStep[] {
  const working = [...values];
  const steps: VisualizationStep[] = [];

  for (let end = working.length - 1; end > 0; end -= 1) {
    let didSwap = false;

    for (let index = 0; index < end; index += 1) {
      steps.push({ type: 'compare', indices: [index, index + 1] });
      if (working[index] > working[index + 1]) {
        [working[index], working[index + 1]] = [working[index + 1], working[index]];
        steps.push({ type: 'swap', indices: [index, index + 1] });
        didSwap = true;
      }
    }

    steps.push({ type: 'markSorted', index: end });
    if (!didSwap) break;
  }

  if (working.length > 0) steps.push({ type: 'markSorted', index: 0 });
  steps.push({ type: 'complete' });
  return steps;
}
