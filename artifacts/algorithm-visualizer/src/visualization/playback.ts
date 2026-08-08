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

    case 'markSorted':
      return {
        ...state,
        stepIndex: state.stepIndex + 1,
        sorted: new Set(state.sorted).add(step.index),
      };

    case 'complete':
      return {
        ...state,
        stepIndex: state.stepIndex + 1,
        status: 'complete',
        sorted: new Set(
          state.values.map((_, index) => index),
        ),
      };
  }
}