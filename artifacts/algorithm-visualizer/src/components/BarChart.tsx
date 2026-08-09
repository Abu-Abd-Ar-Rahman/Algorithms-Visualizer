import { Check, GitCompareArrows, ArrowLeftRight } from 'lucide-react';
import type {
  IndexRange,
  PlaybackStatus,
  VisualizationStep,
} from '@/algorithms/types';

interface BarChartProps {
  values: number[];
  step: VisualizationStep | undefined;
  sorted: Set<number>;
  status: PlaybackStatus;
  showMergeStates?: boolean;
  showQuickStates?: boolean;
}

export function BarChart({
  values,
  step,
  sorted,
  status,
  showMergeStates = false,
  showQuickStates = false,
}: BarChartProps) {
  const max = Math.max(...values, 100);
  const comparing =
    step?.type === 'compare' || step?.type === 'quickCompare'
      ? step.indices
      : undefined;
  const swapping =
    step?.type === 'swap' || step?.type === 'quickSwap'
      ? step.indices
      : undefined;
  const pivotIndex =
    step?.type === 'partitionStart' ||
    step?.type === 'quickCompare' ||
    step?.type === 'quickSwap' ||
    step?.type === 'partitionComplete'
      ? step.pivotIndex
      : undefined;
  const activeRange: IndexRange | undefined =
    step?.type === 'split' ||
    step?.type === 'mergeStart' ||
    step?.type === 'mergeWrite' ||
    step?.type === 'mergeComplete' ||
    step?.type === 'partitionStart' ||
    step?.type === 'quickCompare' ||
    step?.type === 'quickSwap' ||
    step?.type === 'partitionComplete'
      ? step.range
      : undefined;
  const stepLabel =
    step?.type === 'split'
      ? `Splitting range ${step.range[0] + 1}–${step.range[1] + 1}`
      : step?.type === 'mergeStart'
        ? `Merging ${step.range[0] + 1}–${step.range[1] + 1}`
        : step?.type === 'mergeWrite'
          ? `Writing position ${step.index + 1}`
          : step?.type === 'mergeComplete'
            ? `Merged range ${step.range[0] + 1}–${step.range[1] + 1}`
            : step?.type === 'partitionStart'
              ? `Pivot selected at position ${step.pivotIndex + 1}`
              : step?.type === 'quickCompare'
                ? `Comparing against pivot at position ${step.pivotIndex + 1}`
                : step?.type === 'quickSwap'
                  ? `Swapping around pivot at position ${step.pivotIndex + 1}`
                  : step?.type === 'partitionComplete'
                    ? `Pivot placed at position ${step.pivotIndex + 1}`
            : undefined;

  return (
    <section className="relative min-h-[430px] overflow-hidden rounded-2xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] px-4 pb-12 pt-8 shadow-[0_18px_50px_rgba(20,39,53,.06)] sm:px-8" data-testid="visualization-panel">
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(hsl(var(--border)/.45)_1px,transparent_1px)] [background-size:100%_25%]" />
      <div className="relative flex h-[360px] items-end justify-center gap-[3px] border-b border-[hsl(var(--foreground)/.16)] sm:gap-1" data-testid="array-bars">
        {values.map((value, index) => {
          const isCompare = comparing?.includes(index);
          const isSwap = swapping?.includes(index);
          const isInActiveRange =
            activeRange !== undefined &&
            index >= activeRange[0] &&
            index <= activeRange[1];
          const isMergeWrite =
            step?.type === 'mergeWrite' &&
            step.index === index;
          const isPivot =
            showQuickStates &&
            pivotIndex === index &&
            step?.type !== 'partitionComplete';
          const isSorted = sorted.has(index) || status === 'complete';
          const width = values.length > 44 ? 'flex-1 min-w-0' : 'w-3 sm:w-4';
          const barColor = isPivot
            ? 'hsl(var(--primary))'
            : isMergeWrite || isSwap
            ? 'hsl(var(--accent))'
            : isCompare
              ? 'hsl(var(--destructive))'
              : isSorted
                ? 'hsl(var(--primary))'
                : 'hsl(var(--secondary))';
          return (
            <div
              className={`group relative flex h-full items-end ${width} ${
                isInActiveRange && showMergeStates
                  ? 'rounded-t-md bg-[hsl(var(--primary)/.06)]'
                  : ''
              }`}
              key={`${index}-${value}`}
            >
              <div
                className={`relative w-full rounded-t-[3px] transition-[height,background-color,transform] duration-300 ${
                  isMergeWrite || isSwap ? 'bar-swap' : ''
                } ${
                  isInActiveRange && showMergeStates
                    ? 'ring-1 ring-inset ring-[hsl(var(--primary)/.32)]'
                    : ''
                } ${
                  isPivot && showQuickStates
                    ? 'ring-2 ring-[hsl(var(--primary))]'
                    : ''
                }`}
                style={{ height: `${Math.max(7, (value / max) * 100)}%`, backgroundColor: barColor }}
                data-testid={`bar-value-${index}`}
                aria-label={`Value ${value} at position ${index + 1}`}
              >
                {values.length <= 28 ? (
                  <span className={`absolute -top-6 left-1/2 -translate-x-1/2 font-mono text-[9px] tabular-nums transition-opacity ${isCompare || isSwap || isSorted ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} text-[hsl(var(--muted-foreground))]`}>
                    {value}
                  </span>
                ) : null}
                {isSorted && values.length <= 28 ? (
                  <Check className="absolute -bottom-5 left-1/2 size-3 -translate-x-1/2 text-[hsl(var(--primary))]" strokeWidth={3} />
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
      {(showMergeStates || showQuickStates) && stepLabel ? (
        <div
          className="absolute left-5 top-4 max-w-[55%] truncate text-[10px] font-semibold uppercase tracking-[.14em] text-[hsl(var(--primary))] sm:left-8"
          data-testid="merge-step-label"
        >
          {stepLabel}
        </div>
      ) : null}
      <div className="absolute bottom-3 left-5 flex items-center gap-4 text-[10px] font-semibold uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))] sm:left-8">
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[hsl(var(--secondary))]" /> Unvisited</span>
        <span className="flex items-center gap-1.5"><GitCompareArrows className="size-3 text-[hsl(var(--destructive))]" /> Compare</span>
        <span className="flex items-center gap-1.5"><ArrowLeftRight className="size-3 text-[hsl(var(--accent))]" /> Swap</span>
        {showMergeStates ? <span className="flex items-center gap-1.5"><span className="size-2 rounded-sm bg-[hsl(var(--primary)/.45)]" /> Range</span> : null}
        {showQuickStates ? <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[hsl(var(--primary))]" /> Pivot</span> : null}
      </div>
      <div className="absolute right-5 top-4 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))] sm:right-8">
        <span className={`size-2 rounded-full ${status === 'running' ? 'animate-pulse bg-[hsl(var(--primary))]' : status === 'complete' ? 'bg-[hsl(var(--primary))]' : 'bg-[hsl(var(--muted-foreground))]'}`} />
        {status === 'running' ? 'Live execution' : status === 'complete' ? 'Sorted' : status === 'paused' ? 'Playback paused' : 'Ready'}
      </div>
    </section>
  );
}
