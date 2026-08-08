import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import type { VisualizationStep } from '@/algorithms/types';
import {
  applyVisualizationStep,
  createPlaybackState,
  type PlaybackState,
} from '@/visualization/playback';

interface UseVisualizationPlaybackOptions {
  initialValues: readonly number[];
  steps: readonly VisualizationStep[];
  speed: number;
}

export function useVisualizationPlayback({
  initialValues,
  steps,
  speed,
}: UseVisualizationPlaybackOptions): PlaybackState & {
  currentStep: VisualizationStep | undefined;
  start: () => void;
  pause: () => void;
} {
  const [state, setState] = useState<PlaybackState>(() =>
    createPlaybackState(initialValues),
  );

  useEffect(() => {
    setState(createPlaybackState(initialValues));
  }, [initialValues, steps]);

  const advance = useCallback(() => {
    setState((currentState) => {
      if (
        currentState.status !== 'running' ||
        currentState.stepIndex >= steps.length
      ) {
        return currentState;
      }

      return applyVisualizationStep(
        currentState,
        steps[currentState.stepIndex],
      );
    });
  }, [steps]);

  useEffect(() => {
    if (state.status !== 'running') {
      return;
    }

    if (state.stepIndex >= steps.length) {
      setState((currentState) => ({
        ...currentState,
        status: 'complete',
      }));
      return;
    }

    const delay = Math.round(560 / speed);
    const timer = window.setTimeout(advance, delay);

    return () => window.clearTimeout(timer);
  }, [
    advance,
    speed,
    state.status,
    state.stepIndex,
    steps.length,
  ]);

  const start = useCallback(() => {
    setState((currentState) => {
      if (currentState.status === 'complete') {
        return currentState;
      }

      return {
        ...currentState,
        status: 'running',
      };
    });
  }, []);

  const pause = useCallback(() => {
    setState((currentState) => {
      if (currentState.status !== 'running') {
        return currentState;
      }

      return {
        ...currentState,
        status: 'paused',
      };
    });
  }, []);

  return {
    ...state,
    currentStep: steps[state.stepIndex - 1],
    start,
    pause,
  };
}