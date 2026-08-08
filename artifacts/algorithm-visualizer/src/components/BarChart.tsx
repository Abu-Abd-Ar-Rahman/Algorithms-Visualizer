import { Check, GitCompareArrows, ArrowLeftRight } from 'lucide-react';
import type { VisualizationStep } from '@/algorithms/types';

interface BarChartProps {
  values: number[];
  step: VisualizationStep | undefined;
  sorted: Set<number>;
  status: 'ready' | 'running' | 'paused' | 'complete';
}

export function BarChart({ values, step, sorted, status }: BarChartProps) {
  const max = Math.max(...values, 100);
  const comparing = step?.type === 'compare' ? step.indices : undefined;
  const swapping = step?.type === 'swap' ? step.indices : undefined;

  return (
    <section className="relative min-h-[430px] overflow-hidden rounded-2xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] px-4 pb-12 pt-8 shadow-[0_18px_50px_rgba(20,39,53,.06)] sm:px-8" data-testid="visualization-panel">
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(hsl(var(--border)/.45)_1px,transparent_1px)] [background-size:100%_25%]" />
      <div className="relative flex h-[360px] items-end justify-center gap-[3px] border-b border-[hsl(var(--foreground)/.16)] sm:gap-1" data-testid="array-bars">
        {values.map((value, index) => {
          const isCompare = comparing?.includes(index);
          const isSwap = swapping?.includes(index);
          const isSorted = sorted.has(index) || status === 'complete';
          const width = values.length > 44 ? 'flex-1 min-w-0' : 'w-3 sm:w-4';
          const barColor = isSwap
            ? 'hsl(var(--accent))'
            : isCompare
              ? 'hsl(var(--destructive))'
              : isSorted
                ? 'hsl(var(--primary))'
                : 'hsl(var(--secondary))';
          return (
            <div className={`group relative flex h-full items-end ${width}`} key={`${index}-${value}`}>
              <div
                className={`relative w-full rounded-t-[3px] transition-[height,background-color,transform] duration-300 ${isSwap ? 'bar-swap' : ''}`}
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
      <div className="absolute bottom-3 left-5 flex items-center gap-4 text-[10px] font-semibold uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))] sm:left-8">
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[hsl(var(--secondary))]" /> Unvisited</span>
        <span className="flex items-center gap-1.5"><GitCompareArrows className="size-3 text-[hsl(var(--destructive))]" /> Compare</span>
        <span className="flex items-center gap-1.5"><ArrowLeftRight className="size-3 text-[hsl(var(--accent))]" /> Swap</span>
      </div>
      <div className="absolute right-5 top-4 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))] sm:right-8">
        <span className={`size-2 rounded-full ${status === 'running' ? 'animate-pulse bg-[hsl(var(--primary))]' : status === 'complete' ? 'bg-[hsl(var(--primary))]' : 'bg-[hsl(var(--muted-foreground))]'}`} />
        {status === 'running' ? 'Live execution' : status === 'complete' ? 'Sorted' : status === 'paused' ? 'Playback paused' : 'Ready'}
      </div>
    </section>
  );
}
