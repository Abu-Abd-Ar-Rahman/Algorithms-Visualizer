import type {
  IndexRange,
  VisualizationStep,
} from './types';

/**
 * Creates a playback script for Merge Sort.
 *
 * The returned steps are deliberately separate from React and the DOM. The
 * visualizer can play them slowly, pause them, or test them without changing
 * how Merge Sort itself works.
 */
export function generateMergeSortSteps(
  values: readonly number[],
): VisualizationStep[] {
  const working = [...values];
  const steps: VisualizationStep[] = [];

  /**
   * Merge Sort's base case is a range containing zero or one values.
   *
   * Such a range is already sorted, so the recursive function returns without
   * splitting it any further. This is what prevents the recursion from
   * continuing forever.
   */
  function sortRange(
    start: number,
    end: number,
    depth: number,
  ): void {
    if (start >= end) {
      return;
    }

    /**
     * The midpoint divides the current range into two smaller ranges:
     * [start, middle] and [middle + 1, end].
     *
     * Each recursive call keeps dividing its own half until the base case is
     * reached. The split step lets the UI show this divide-and-conquer phase.
     */
    const middle = Math.floor((start + end) / 2);
    const range: IndexRange = [start, end];

    steps.push({
      type: 'split',
      range,
      depth,
    });

    sortRange(start, middle, depth + 1);
    sortRange(middle + 1, end, depth + 1);

    /**
     * Both halves are sorted when the recursive calls return. We can now
     * merge them into one sorted range.
     *
     * The left and right pointers walk through their halves. At each
     * comparison, the smaller value is copied into the temporary `merged`
     * array. This is different from Bubble Sort: Merge Sort writes values back
     * into positions instead of repeatedly swapping neighboring bars.
     */
    const leftRange: IndexRange = [start, middle];
    const rightRange: IndexRange = [middle + 1, end];

    steps.push({
      type: 'mergeStart',
      range,
      leftRange,
      rightRange,
    });

    const merged: number[] = [];
    let left = start;
    let right = middle + 1;

    while (left <= middle && right <= end) {
      steps.push({
        type: 'compare',
        indices: [left, right],
      });

      if (working[left] <= working[right]) {
        merged.push(working[left]);
        left += 1;
      } else {
        merged.push(working[right]);
        right += 1;
      }
    }

    while (left <= middle) {
      merged.push(working[left]);
      left += 1;
    }

    while (right <= end) {
      merged.push(working[right]);
      right += 1;
    }

    /**
     * Finally, copy the merged values back into the original positions.
     * Emitting one write step per position makes the "merge back together"
     * phase visible instead of jumping directly to the final result.
     */
    merged.forEach((value, offset) => {
      const index = start + offset;
      working[index] = value;
      steps.push({
        type: 'mergeWrite',
        range,
        index,
        value,
      });
    });

    steps.push({
      type: 'mergeComplete',
      range,
    });
  }

  if (working.length > 1) {
    sortRange(0, working.length - 1, 0);
  }

  steps.push({ type: 'complete' });
  return steps;
}