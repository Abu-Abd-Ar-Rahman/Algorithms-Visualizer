import { GitCompareArrows, ArrowLeftRight, Check, Crown } from 'lucide-react';
import type {
  PlaybackStatus,
  VisualizationStep,
} from '@/algorithms/types';

interface HeapTreeProps {
  values: number[];
  step: VisualizationStep | undefined;
  sorted: Set<number>;
  status: PlaybackStatus;
  heapSize: number;
}

const TREE_WIDTH = 960;
const LEVEL_HEIGHT = 76;
const NODE_WIDTH = 48;
const NODE_HEIGHT = 44;

function getNodePosition(index: number) {
  const depth = Math.floor(Math.log2(index + 1));
  const firstIndexAtLevel = 2 ** depth - 1;
  const positionAtLevel = index - firstIndexAtLevel;
  const nodesAtLevel = 2 ** depth;

  return {
    x: ((positionAtLevel + 0.5) / nodesAtLevel) * TREE_WIDTH,
    y: 30 + depth * LEVEL_HEIGHT,
  };
}

function getTreeHeight(size: number) {
  return Math.max(1, Math.ceil(Math.log2(Math.max(size, 1) + 1)));
}

export function HeapTree({
  values,
  step,
  sorted,
  status,
  heapSize,
}: HeapTreeProps) {
  const activeCount = status === 'complete' ? values.length : heapSize;
  const treeHeight = getTreeHeight(values.length);
  const treeWidth = Math.max(TREE_WIDTH, values.length <= 16 ? 720 : TREE_WIDTH);
  const treeBottom = 30 + (treeHeight - 1) * LEVEL_HEIGHT;
  const comparing =
    step?.type === 'heapCompare' ? step.indices : undefined;
  const swapping =
    step?.type === 'heapSwap' ? step.indices : undefined;
  const extracting =
    step?.type === 'heapExtract'
      ? [0, step.targetIndex]
      : undefined;
  const heapifyRoot =
    step?.type === 'heapifyStart' ? step.rootIndex : undefined;
  const stepLabel =
    step?.type === 'heapifyStart'
      ? `${step.phase === 'build' ? 'Building' : 'Restoring'} heap`
      : step?.type === 'heapExtract'
        ? `Extracting max → position ${step.targetIndex + 1}`
        : step?.type === 'heapCompare'
          ? 'Comparing parent and child'
          : step?.type === 'heapSwap'
            ? 'Swapping to restore heap order'
            : undefined;

  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] px-4 pb-12 pt-8 shadow-[0_18px_50px_rgba(20,39,53,.06)] sm:px-8"
      data-testid="heap-visualization-panel"
    >
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(hsl(var(--border)/.45)_1px,transparent_1px)] [background-size:100%_25%]" />
      <div
        className="relative overflow-x-auto"
        data-testid="heap-tree"
        aria-label="Binary max heap visualization"
      >
        <div
          className="relative mx-auto min-w-[720px]"
          style={{
            width: `${treeWidth}px`,
            height: `${treeBottom + NODE_HEIGHT + 18}px`,
          }}
        >
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox={`0 0 ${treeWidth} ${treeBottom + NODE_HEIGHT + 18}`}
            aria-hidden="true"
          >
            {values.map((_, index) => {
              const leftChild = index * 2 + 1;
              const rightChild = leftChild + 1;
              const parentPosition = getNodePosition(index);

              return [leftChild, rightChild].map((childIndex) => {
                if (childIndex >= values.length) {
                  return null;
                }
                const childPosition = getNodePosition(childIndex);
                const isActive =
                  index < activeCount && childIndex < activeCount;
                return (
                  <line
                    key={`${index}-${childIndex}`}
                    x1={parentPosition.x}
                    y1={parentPosition.y + NODE_HEIGHT / 2}
                    x2={childPosition.x}
                    y2={childPosition.y - NODE_HEIGHT / 2}
                    stroke={
                      isActive
                        ? 'hsl(var(--secondary) / .32)'
                        : 'hsl(var(--border) / .65)'
                    }
                    strokeWidth="1.5"
                    strokeDasharray={isActive ? undefined : '4 4'}
                  />
                );
              });
            })}
          </svg>

          {values.map((value, index) => {
            const position = getNodePosition(index);
            const isActive = index < activeCount;
            const isCompare = comparing?.includes(index);
            const isSwap = swapping?.includes(index);
            const isExtracting = extracting?.includes(index);
            const isRoot = heapifyRoot === index;
            const isSorted = sorted.has(index) || status === 'complete';
            const color = isSorted
              ? 'hsl(var(--primary))'
              : isSwap
                ? 'hsl(var(--accent))'
                : isCompare
                  ? 'hsl(var(--destructive))'
                  : isExtracting || isRoot
                    ? 'hsl(var(--primary))'
                    : isActive
                      ? 'hsl(var(--secondary))'
                      : 'hsl(var(--muted-foreground))';

            return (
              <div
                key={`${index}-${value}`}
                className={`absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 transition-all duration-300 ${
                  isActive ? 'opacity-100' : 'opacity-45'
                }`}
                style={{
                  left: `${position.x}px`,
                  top: `${position.y}px`,
                  width: `${NODE_WIDTH}px`,
                }}
              >
                <div
                  className={`grid size-11 place-items-center rounded-xl border-2 font-mono text-sm font-bold text-[hsl(var(--card))] shadow-sm transition-transform duration-300 ${
                    isSwap || isExtracting || isRoot ? 'scale-110' : ''
                  }`}
                  style={{
                    backgroundColor: color,
                    borderColor: color,
                  }}
                  data-testid={`heap-node-${index}`}
                  aria-label={`Heap value ${value} at position ${index + 1}`}
                >
                  {value}
                  {index === 0 && isActive ? (
                    <Crown className="absolute -top-4 size-3 text-[hsl(var(--accent-foreground))]" />
                  ) : null}
                </div>
                <span className="font-mono text-[9px] text-[hsl(var(--muted-foreground))]">
                  {index}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {(stepLabel || status === 'complete') ? (
        <div
          className="absolute left-5 top-4 max-w-[60%] truncate text-[10px] font-semibold uppercase tracking-[.14em] text-[hsl(var(--primary))] sm:left-8"
          data-testid="heap-step-label"
        >
          {status === 'complete' ? 'Heap fully extracted' : stepLabel}
        </div>
      ) : null}
      <div className="absolute bottom-3 left-5 flex items-center gap-4 text-[10px] font-semibold uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))] sm:left-8">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-[hsl(var(--secondary))]" /> Heap
        </span>
        <span className="flex items-center gap-1.5">
          <GitCompareArrows className="size-3 text-[hsl(var(--destructive))]" /> Compare
        </span>
        <span className="flex items-center gap-1.5">
          <ArrowLeftRight className="size-3 text-[hsl(var(--accent))]" /> Swap
        </span>
        <span className="flex items-center gap-1.5">
          <Check className="size-3 text-[hsl(var(--primary))]" /> Extracted
        </span>
      </div>
      <div className="absolute right-5 top-4 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))] sm:right-8">
        <span className={`size-2 rounded-full ${status === 'running' ? 'animate-pulse bg-[hsl(var(--primary))]' : status === 'complete' ? 'bg-[hsl(var(--primary))]' : 'bg-[hsl(var(--muted-foreground))]'}`} />
        {status === 'running'
          ? 'Live execution'
          : status === 'complete'
            ? 'Sorted'
            : status === 'paused'
              ? 'Playback paused'
              : 'Ready'}
      </div>
    </section>
  );
}