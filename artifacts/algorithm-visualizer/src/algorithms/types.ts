export type PlaybackStatus = 'ready' | 'running' | 'paused' | 'complete';

export type IndexPair = [number, number];
export type IndexRange = [number, number];

export type VisualizationStep =
  | {
      type: 'compare';
      indices: IndexPair;
    }
  | {
      type: 'swap';
      indices: IndexPair;
    }
  | {
      type: 'markSorted';
      index: number;
    }
  | {
      type: 'split';
      range: IndexRange;
      depth: number;
    }
  | {
      type: 'mergeStart';
      range: IndexRange;
      leftRange: IndexRange;
      rightRange: IndexRange;
    }
  | {
      type: 'mergeWrite';
      range: IndexRange;
      index: number;
      value: number;
    }
  | {
      type: 'mergeComplete';
      range: IndexRange;
    }
  | {
      type: 'partitionStart';
      range: IndexRange;
      pivotIndex: number;
      depth: number;
    }
  | {
      type: 'quickCompare';
      indices: IndexPair;
      range: IndexRange;
      pivotIndex: number;
    }
  | {
      type: 'quickSwap';
      indices: IndexPair;
      range: IndexRange;
      pivotIndex: number;
    }
  | {
      type: 'partitionComplete';
      range: IndexRange;
      pivotIndex: number;
    }
  | {
      type: 'complete';
    };
