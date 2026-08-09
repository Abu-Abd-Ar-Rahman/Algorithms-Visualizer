import type { IndexRange, VisualizationStep } from './types';

/**
 * Produces typed playback steps for Quick Sort without depending on the UI.
 * The renderer can therefore show the pivot and each partition operation at
 * its own pace.
 */
export function generateQuickSortSteps(
  values: readonly number[],
): VisualizationStep[] {
  const working = [...values];
  const steps: VisualizationStep[] = [];

  /**
   * A range with fewer than two values is already sorted: this is Quick
   * Sort's base case. Larger ranges choose a pivot and partition themselves
   * into values on the left and right of that pivot.
   */
  function sortRange(low: number, high: number, depth: number): void {
    if (low >= high) {
      return;
    }

    const range: IndexRange = [low, high];
    const pivotIndex = high;

    steps.push({
      type: 'partitionStart',
      range,
      pivotIndex,
      depth,
    });

    /**
     * The pivot stays at `high` while the scan runs. Every value smaller than
     * it is swapped into the next position on the left, so the pivot can be
     * placed between the two resulting partitions at the end.
     */
    let boundary = low;
    for (let index = low; index < high; index += 1) {
      steps.push({
        type: 'quickCompare',
        indices: [index, pivotIndex],
        range,
        pivotIndex,
      });

      if (working[index] <= working[pivotIndex]) {
        if (boundary !== index) {
          [working[boundary], working[index]] = [
            working[index],
            working[boundary],
          ];
          steps.push({
            type: 'quickSwap',
            indices: [boundary, index],
            range,
            pivotIndex,
          });
        }
        boundary += 1;
      }
    }

    if (boundary !== pivotIndex) {
      [working[boundary], working[pivotIndex]] = [
        working[pivotIndex],
        working[boundary],
      ];
      steps.push({
        type: 'quickSwap',
        indices: [boundary, pivotIndex],
        range,
        pivotIndex,
      });
    }

    steps.push({
      type: 'partitionComplete',
      range,
      pivotIndex: boundary,
    });

    // Recursively partition the two sides around the pivot.
    sortRange(low, boundary - 1, depth + 1);
    sortRange(boundary + 1, high, depth + 1);
  }

  sortRange(0, working.length - 1, 0);
  steps.push({ type: 'complete' });
  return steps;
}