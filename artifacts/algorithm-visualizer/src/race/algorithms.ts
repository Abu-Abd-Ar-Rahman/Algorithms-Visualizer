import { generateBubbleSortSteps } from '@/algorithms/bubble-sort';
import { generateHeapSortSteps } from '@/algorithms/heap-sort';
import { generateMergeSortSteps } from '@/algorithms/merge-sort';
import { generateQuickSortSteps } from '@/algorithms/quick-sort';
import type { VisualizationStep } from '@/algorithms/types';

export type RaceAlgorithmId = 'bubble' | 'merge' | 'quick' | 'heap';

export interface RaceAlgorithmDefinition {
  id: RaceAlgorithmId;
  label: string;
  complexity: string;
  description: string;
}

export const RACE_ALGORITHMS: RaceAlgorithmDefinition[] = [
  {
    id: 'bubble',
    label: 'Bubble Sort',
    complexity: 'O(n²)',
    description: 'Neighbor comparisons',
  },
  {
    id: 'merge',
    label: 'Merge Sort',
    complexity: 'O(n log n)',
    description: 'Divide and merge',
  },
  {
    id: 'quick',
    label: 'Quick Sort',
    complexity: 'O(n log n)',
    description: 'Pivot partitioning',
  },
  {
    id: 'heap',
    label: 'Heap Sort',
    complexity: 'O(n log n)',
    description: 'Max-heap extraction',
  },
];

/**
 * Race Mode delegates step generation to the same algorithm modules used by
 * the individual visualizers. This keeps every racer faithful to its page.
 */
export function generateRaceSteps(
  algorithm: RaceAlgorithmId,
  values: readonly number[],
): VisualizationStep[] {
  switch (algorithm) {
    case 'bubble':
      return generateBubbleSortSteps(values);
    case 'merge':
      return generateMergeSortSteps(values);
    case 'quick':
      return generateQuickSortSteps(values);
    case 'heap':
      return generateHeapSortSteps(values);
  }
}

export function getRaceAlgorithm(
  algorithm: RaceAlgorithmId,
): RaceAlgorithmDefinition {
  return RACE_ALGORITHMS.find(({ id }) => id === algorithm)!;
}