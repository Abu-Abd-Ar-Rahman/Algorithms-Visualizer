import type { VisualizationStep } from './types';

/**
 * Creates a DOM-independent Heap Sort playback script.
 *
 * The array is represented as a complete binary tree: for a node at index i,
 * its children live at 2 * i + 1 and 2 * i + 2.
 */
export function generateHeapSortSteps(
  values: readonly number[],
): VisualizationStep[] {
  const working = [...values];
  const steps: VisualizationStep[] = [];

  /**
   * Heapify restores the max-heap rule below one root. We compare the root
   * with its children, swap it with the larger child when necessary, then
   * continue down the affected branch.
   */
  function heapify(
    rootIndex: number,
    heapSize: number,
    phase: 'build' | 'extract',
  ): void {
    steps.push({
      type: 'heapifyStart',
      heapSize,
      rootIndex,
      phase,
    });

    let root = rootIndex;

    while (true) {
      const leftChild = root * 2 + 1;
      const rightChild = leftChild + 1;
      let largest = root;

      if (leftChild < heapSize) {
        steps.push({
          type: 'heapCompare',
          indices: [root, leftChild],
          heapSize,
          phase,
        });
        if (working[leftChild] > working[largest]) {
          largest = leftChild;
        }
      }

      if (rightChild < heapSize) {
        steps.push({
          type: 'heapCompare',
          indices: [largest, rightChild],
          heapSize,
          phase,
        });
        if (working[rightChild] > working[largest]) {
          largest = rightChild;
        }
      }

      if (largest === root) {
        return;
      }

      [working[root], working[largest]] = [
        working[largest],
        working[root],
      ];
      steps.push({
        type: 'heapSwap',
        indices: [root, largest],
        heapSize,
        phase,
      });
      root = largest;
    }
  }

  /**
   * Build the max heap from the bottom-most parent upward. Once complete, the
   * largest value is always at the tree root (index 0).
   */
  for (
    let parent = Math.floor(working.length / 2) - 1;
    parent >= 0;
    parent -= 1
  ) {
    heapify(parent, working.length, 'build');
  }

  /**
   * Extraction swaps the maximum root with the final active heap position.
   * That position is now permanently sorted, so the heap shrinks by one and
   * heapify restores the max-heap rule before the next extraction.
   */
  for (let end = working.length - 1; end > 0; end -= 1) {
    steps.push({
      type: 'heapExtract',
      heapSize: end + 1,
      targetIndex: end,
    });

    [working[0], working[end]] = [working[end], working[0]];
    steps.push({
      type: 'heapSwap',
      indices: [0, end],
      heapSize: end,
      phase: 'extract',
    });
    steps.push({
      type: 'markSorted',
      index: end,
    });

    heapify(0, end, 'extract');
  }

  if (working.length === 1) {
    steps.push({
      type: 'markSorted',
      index: 0,
    });
  }

  steps.push({ type: 'complete' });
  return steps;
}