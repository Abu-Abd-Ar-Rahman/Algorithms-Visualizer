import { Pause, Play, RotateCcw, Shuffle, Zap } from 'lucide-react';

interface ControlPanelProps {
  arraySize: number;
  speed: number;
  status: 'ready' | 'running' | 'paused' | 'complete';
  onArraySizeChange: (value: number) => void;
  onSpeedChange: (value: number) => void;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

export function ControlPanel({ arraySize, speed, status, onArraySizeChange, onSpeedChange, onStart, onPause, onReset }: ControlPanelProps) {
  const isRunning = status === 'running';
  return (
    <aside className="flex flex-col gap-5 rounded-2xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-5 shadow-[0_18px_50px_rgba(20,39,53,.05)] sm:p-6" data-testid="control-panel">
      <div className="flex items-center gap-2 border-b border-[hsl(var(--border))] pb-4">
        <div className="grid size-8 place-items-center rounded-lg bg-[hsl(var(--primary)/.12)] text-[hsl(var(--primary))]"><Zap className="size-4" fill="currentColor" /></div>
        <div>
          <h2 className="text-sm font-extrabold tracking-[-.02em]">Playback controls</h2>
          <p className="text-[11px] text-[hsl(var(--muted-foreground))]">Tune the experiment</p>
        </div>
      </div>

      <label className="block" htmlFor="array-size">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-bold">Array size</span>
          <span className="font-mono text-xs text-[hsl(var(--primary))]" data-testid="text-array-size">{arraySize} values</span>
        </div>
        <input id="array-size" data-testid="input-array-size" type="range" min="8" max="64" step="1" value={arraySize} onChange={(event) => onArraySizeChange(Number(event.target.value))} className="h-1.5 w-full cursor-pointer accent-[hsl(var(--primary))]" disabled={isRunning} />
        <div className="mt-1 flex justify-between font-mono text-[10px] text-[hsl(var(--muted-foreground))]"><span>8</span><span>64</span></div>
      </label>

      <label className="block" htmlFor="animation-speed">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-bold">Animation speed</span>
          <span className="font-mono text-xs text-[hsl(var(--accent-foreground))]" data-testid="text-animation-speed">{speed === 1 ? 'Measured' : speed === 5 ? 'Rapid' : `${speed}/5`}</span>
        </div>
        <input id="animation-speed" data-testid="input-animation-speed" type="range" min="1" max="5" step="1" value={speed} onChange={(event) => onSpeedChange(Number(event.target.value))} className="h-1.5 w-full cursor-pointer accent-[hsl(var(--accent))]" />
        <div className="mt-1 flex justify-between font-mono text-[10px] text-[hsl(var(--muted-foreground))]"><span>Slow</span><span>Fast</span></div>
      </label>

      <div className="grid grid-cols-2 gap-2 pt-1">
        <button type="button" data-testid="button-start" onClick={onStart} disabled={isRunning || status === 'complete'} className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-3 text-xs font-extrabold text-[hsl(var(--primary-foreground))] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-40">
          <Play className="size-4" fill="currentColor" /> Start
        </button>
        <button type="button" data-testid="button-pause" onClick={onPause} disabled={!isRunning} className="flex h-11 items-center justify-center gap-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 text-xs font-extrabold transition hover:bg-[hsl(var(--muted))] disabled:cursor-not-allowed disabled:opacity-40">
          <Pause className="size-4" fill="currentColor" /> Pause
        </button>
      </div>
      <button type="button" data-testid="button-reset" onClick={onReset} className="flex h-10 items-center justify-center gap-2 rounded-lg border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]">
        <RotateCcw className="size-3.5" /> Generate new array
      </button>
      <p className="border-t border-[hsl(var(--border))] pt-4 text-[11px] leading-relaxed text-[hsl(var(--muted-foreground))]">
        <span className="font-bold text-[hsl(var(--foreground))]">Tip:</span> Pause mid-pass to inspect exactly which neighboring values are being compared.
      </p>
    </aside>
  );
}
