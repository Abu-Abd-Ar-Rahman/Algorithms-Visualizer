import type {
  PlaybackStatus,
  VisualizationStep,
} from '@/algorithms/types';

export interface PlaybackState {
  values: number[];
  stepIndex: number;
  status: PlaybackStatus;
  comparisons: number;
  swaps: number;
  merges: number;
  heapSize: number;
  sorted: Set<number>;
}

export function createPlaybackState(
  values: readonly number[],
): PlaybackState {
  return {
    values: [...values],
    stepIndex: 0,
    status: 'ready',
    comparisons: 0,
    swaps: 0,
    merges: 0,
    heapSize: values.length,
    sorted: new Set<number>(),
  };
}

export function applyVisualizationStep(
  state: PlaybackState,
  step: VisualizationStep,
): PlaybackState {
  switch (step.type) {
    case 'compare':
      return {
        ...state,
        stepIndex: state.stepIndex + 1,
        comparisons: state.comparisons + 1,
      };

    case 'quickCompare':
      return {
        ...state,
        stepIndex: state.stepIndex + 1,
        comparisons: state.comparisons + 1,
      };

    case 'heapCompare':
      return {
        ...state,
        stepIndex: state.stepIndex + 1,
        comparisons: state.comparisons + 1,
        heapSize: step.heapSize,
      };

    case 'swap': {
      const [firstIndex, secondIndex] = step.indices;
      const values = [...state.values];
      [values[firstIndex], values[secondIndex]] = [
        values[secondIndex],
        values[firstIndex],
      ];

      return {
        ...state,
        values,
        stepIndex: state.stepIndex + 1,
        swaps: state.swaps + 1,
      };
    }

    case 'quickSwap': {
      const [firstIndex, secondIndex] = step.indices;
      const values = [...state.values];
      [values[firstIndex], values[secondIndex]] = [
        values[secondIndex],
        values[firstIndex],
      ];

      return {
        ...state,
        values,
        stepIndex: state.stepIndex + 1,
        swaps: state.swaps + 1,
      };
    }

    case 'heapSwap': {
      const [firstIndex, secondIndex] = step.indices;
      const values = [...state.values];
      [values[firstIndex], values[secondIndex]] = [
        values[secondIndex],
        values[firstIndex],
      ];

      return {
        ...state,
        values,
        stepIndex: state.stepIndex + 1,
        swaps: state.swaps + 1,
        heapSize: step.heapSize,
      };
    }

    case 'markSorted':
      return {
        ...state,
        stepIndex: state.stepIndex + 1,
        sorted: new Set(state.sorted).add(step.index),
      };

    case 'split':
    case 'mergeStart':
    case 'partitionStart':
    case 'partitionComplete':
    case 'heapifyStart':
    case 'heapExtract':
      return {
        ...state,
        stepIndex: state.stepIndex + 1,
        heapSize:
          step.type === 'heapifyStart' || step.type === 'heapExtract'
            ? step.heapSize
            : state.heapSize,
      };

    case 'mergeWrite': {
      const values = [...state.values];
      values[step.index] = step.value;

      return {
        ...state,
        values,
        stepIndex: state.stepIndex + 1,
      };
    }

    case 'mergeComplete':
      return {
        ...state,
        stepIndex: state.stepIndex + 1,
        merges: state.merges + 1,
      };

    case 'complete':
      return {
        ...state,
        stepIndex: state.stepIndex + 1,
        status: 'complete',
        heapSize: 0,
        sorted: new Set(
          state.values.map((_, index) => index),
        ),
      };
  }
}