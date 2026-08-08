export type PlaybackStatus = 'ready' | 'running' | 'paused' | 'complete';

export type VisualizationStep =
  | {
      type: 'compare';
      indices: [number, number];
    }
  | {
      type: 'swap';
      indices: [number, number];
    }
  | {
      type: 'markSorted';
      index: number;
    }
  | {
      type: 'complete';
    };
