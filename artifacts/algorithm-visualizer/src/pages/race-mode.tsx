import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  BarChart3,
  CheckCircle2,
  CircleHelp,
  Flag,
  GitCompareArrows,
  Pause,
  Play,
  RotateCcw,
  Trophy,
} from 'lucide-react';

import { BarChart } from '@/components/BarChart';
import { AlgorithmTabs } from '@/components/AlgorithmTabs';
import { HeapTree } from '@/components/HeapTree';
import { useVisualizationPlayback } from '@/hooks/use-visualization-playback';
import {
  getRaceAlgorithm,
  generateRaceSteps,
  RACE_ALGORITHMS,
  type RaceAlgorithmId,
} from '@/race/algorithms';

interface RaceModePageProps {
  createArray: (size: number) => number[];
}

type RaceCommand = 'start' | 'pause' | null;

function RaceAlgorithmPanel({
  algorithm,
  values,
  speed,
  command,
  winner,
  onComplete,
}: {
  algorithm: RaceAlgorithmId;
  values: readonly number[];
  speed: number;
  command: { id: number; type: RaceCommand };
  winner: RaceAlgorithmId | null;
  onComplete: (algorithm: RaceAlgorithmId) => void;
}) {
  const steps = useMemo(
    () => generateRaceSteps(algorithm, values),
    [algorithm, values],
  );
  const playback = useVisualizationPlayback({
    initialValues: values,
    steps,
    speed,
  });
  const definition = getRaceAlgorithm(algorithm);
  const totalComparisons = steps.filter(
    (step) =>
      step.type === 'compare' ||
      step.type === 'quickCompare' ||
      step.type === 'heapCompare',
  ).length;

  useEffect(() => {
    if (command.type === 'start') {
      playback.start();
    } else if (command.type === 'pause') {
      playback.pause();
    }
  }, [command, playback.pause, playback.start]);

  useEffect(() => {
    if (playback.status === 'complete') {
      onComplete(algorithm);
    }
  }, [algorithm, onComplete, playback.status]);

  const isWinner = winner === algorithm;
  const progress = steps.length
    ? Math.min(100, Math.round((playback.stepIndex / steps.length) * 100))
    : 0;

  return (
    <article
      className={`overflow-hidden rounded-2xl border bg-[hsl(var(--card))] shadow-[0_18px_50px_rgba(20,39,53,.05)] transition ${
        isWinner
          ? 'border-[hsl(var(--primary))] ring-2 ring-[hsl(var(--primary)/.16)]'
          : 'border-[hsl(var(--card-border))]'
      }`}
      data-testid={`race-panel-${algorithm}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[hsl(var(--border))] px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="grid size-8 place-items-center rounded-lg bg-[hsl(var(--secondary)/.1)] text-[hsl(var(--secondary))]">
            {isWinner ? <Trophy className="size-4 text-[hsl(var(--primary))]" /> : <Flag className="size-4" />}
          </div>
          <div>
            <h2 className="text-sm font-extrabold tracking-[-.02em]">{definition.label}</h2>
            <p className="text-[10px] uppercase tracking-[.13em] text-[hsl(var(--muted-foreground))]">
              {definition.description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isWinner ? (
            <span className="rounded-full bg-[hsl(var(--primary)/.12)] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[.12em] text-[hsl(var(--primary))]" data-testid={`race-winner-${algorithm}`}>
              Finished first
            </span>
          ) : null}
          <span className="rounded-full border border-[hsl(var(--border))] px-2.5 py-1 font-mono text-[10px] text-[hsl(var(--muted-foreground))]">
            {definition.complexity}
          </span>
        </div>
      </div>

      <div className="p-3 sm:p-4">
        {algorithm === 'heap' ? (
          <HeapTree
            values={playback.values}
            step={playback.currentStep}
            sorted={playback.sorted}
            status={playback.status}
            heapSize={playback.heapSize}
          />
        ) : (
          <BarChart
            values={playback.values}
            step={playback.currentStep}
            sorted={playback.sorted}
            status={playback.status}
            showMergeStates={algorithm === 'merge'}
            showQuickStates={algorithm === 'quick'}
          />
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-[hsl(var(--border))] p-3 sm:grid-cols-4">
        <div className="rounded-lg bg-[hsl(var(--background)/.7)] px-3 py-2" data-testid={`race-comparisons-${algorithm}`}>
          <p className="text-[9px] font-bold uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">Comparisons</p>
          <p className="mt-1 font-mono text-xl font-medium">{playback.comparisons.toString().padStart(2, '0')}</p>
          <p className="font-mono text-[9px] text-[hsl(var(--muted-foreground))]">
            {totalComparisons ? `${Math.round((playback.comparisons / totalComparisons) * 100)}%` : '—'}
          </p>
        </div>
        <div className="rounded-lg bg-[hsl(var(--background)/.7)] px-3 py-2" data-testid={`race-swaps-${algorithm}`}>
          <p className="text-[9px] font-bold uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">Swaps</p>
          <p className="mt-1 font-mono text-xl font-medium">{playback.swaps.toString().padStart(2, '0')}</p>
          <p className="font-mono text-[9px] text-[hsl(var(--muted-foreground))]">running</p>
        </div>
        <div className="col-span-2 rounded-lg bg-[hsl(var(--background)/.7)] px-3 py-2">
          <div className="flex items-center justify-between gap-2">
            <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">
              <GitCompareArrows className="size-3" /> Progress
            </p>
            <span className="font-mono text-[10px] text-[hsl(var(--primary))]">{progress}%</span>
          </div>
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-[hsl(var(--muted))]">
            <div className="h-full rounded-full bg-[hsl(var(--primary))] transition-[width] duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>
    </article>
  );
}

function createRaceArray(size: number): number[] {
  const values = Array.from({ length: size }, (_, index) => {
    const wave = Math.sin(index * 1.73) * 25 + Math.cos(index * 0.46) * 18;
    return Math.max(8, Math.min(96, Math.round(52 + wave + ((index * 19) % 17) - 8)));
  });

  for (let index = values.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [values[index], values[randomIndex]] = [values[randomIndex], values[index]];
  }

  return values;
}

export default function RaceModePage({ createArray }: RaceModePageProps) {
  const [arraySize, setArraySize] = useState(20);
  const [speed, setSpeed] = useState(3);
  const [values, setValues] = useState<readonly number[]>(() => createArray(20));
  const [selected, setSelected] = useState<RaceAlgorithmId[]>([
    'bubble',
    'merge',
    'quick',
    'heap',
  ]);
  const [command, setCommand] = useState<{ id: number; type: RaceCommand }>({
    id: 0,
    type: null,
  });
  const [winner, setWinner] = useState<RaceAlgorithmId | null>(null);

  const updateCommand = useCallback((type: RaceCommand) => {
    setCommand((current) => ({ id: current.id + 1, type }));
  }, []);

  const handleComplete = useCallback((algorithm: RaceAlgorithmId) => {
    setWinner((currentWinner) => currentWinner ?? algorithm);
  }, []);

  const reset = useCallback(
    (size = arraySize) => {
      setValues(createArray(size));
      setWinner(null);
      setCommand((current) => ({ id: current.id + 1, type: null }));
    },
    [arraySize, createArray],
  );

  const toggleAlgorithm = (algorithm: RaceAlgorithmId) => {
    setSelected((current) => {
      if (current.includes(algorithm)) {
        return current.length > 2
          ? current.filter((value) => value !== algorithm)
          : current;
      }
      return [...current, algorithm];
    });
    setWinner(null);
    setCommand((current) => ({ id: current.id + 1, type: null }));
  };

  const raceReady = selected.length >= 2;
  const isRunning = command.type === 'start';
  const selectedDefinitions = RACE_ALGORITHMS.filter(({ id }) => selected.includes(id));

  return (
    <div className="grain min-h-[100dvh] bg-[hsl(var(--background))]">
      <header className="border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/.92)] backdrop-blur">
        <div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-10">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-xl bg-[hsl(var(--secondary))] text-[hsl(var(--accent))]">
              <BarChart3 className="size-4" />
            </div>
            <div>
              <p className="text-sm font-extrabold tracking-[-.03em]">Algorithm Visualizer</p>
              <p className="font-mono text-[9px] uppercase tracking-[.18em] text-[hsl(var(--muted-foreground))]">Understand the motion</p>
            </div>
          </div>
          <AlgorithmTabs />
          <div className="flex items-center gap-2 rounded-full border border-[hsl(var(--border))] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]" data-testid="status-algorithm">
            <span className="size-1.5 rounded-full bg-[hsl(var(--accent))]" /> Race mode / same input
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1320px] px-5 pb-14 pt-9 sm:px-8 lg:px-10 lg:pt-14">
        <div className="mb-8 max-w-3xl animate-rise-in">
          <div className="mb-4 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[.2em] text-[hsl(var(--primary))]">
            <Activity className="size-3.5" /> Comparative laboratory
          </div>
          <h1 className="max-w-3xl text-4xl font-extrabold leading-[.98] tracking-[-.07em] text-[hsl(var(--foreground))] sm:text-6xl">
            Same array.
            <br />
            <span className="text-[hsl(var(--primary))]">Different strategies.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-[hsl(var(--muted-foreground))] sm:text-base">
            Send two or more algorithms into the same race. Every runner gets
            an independent animation, while the input and speed stay locked
            for a fair comparison.
          </p>
        </div>

        <section className="mb-6 grid gap-4 rounded-2xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card)/.72)] p-4 shadow-[0_18px_50px_rgba(20,39,53,.04)] lg:grid-cols-[1fr_auto] lg:items-center" data-testid="race-controls">
          <div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-extrabold">Choose your lineup</p>
                <p className="mt-1 text-[11px] text-[hsl(var(--muted-foreground))]">Select at least two algorithms to start a race.</p>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[.12em] text-[hsl(var(--primary))]">{selected.length} selected</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {RACE_ALGORITHMS.map((algorithm) => {
                const checked = selected.includes(algorithm.id);
                const cannotRemove = checked && selected.length === 2;
                return (
                  <label
                    key={algorithm.id}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold transition ${
                      checked
                        ? 'border-[hsl(var(--primary)/.45)] bg-[hsl(var(--primary)/.08)] text-[hsl(var(--foreground))]'
                        : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={cannotRemove || isRunning}
                      onChange={() => toggleAlgorithm(algorithm.id)}
                      className="size-3.5 accent-[hsl(var(--primary))]"
                      data-testid={`checkbox-race-${algorithm.id}`}
                    />
                    {algorithm.label}
                  </label>
                );
              })}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <button
              type="button"
              onClick={() => updateCommand(isRunning ? 'pause' : 'start')}
              disabled={!raceReady}
              data-testid="button-race-start"
              className="flex h-10 items-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-4 text-xs font-extrabold text-[hsl(var(--primary-foreground))] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isRunning ? <Pause className="size-3.5" fill="currentColor" /> : <Play className="size-3.5" fill="currentColor" />}
              {isRunning ? 'Pause race' : 'Start race'}
            </button>
            <button
              type="button"
              onClick={() => reset()}
              data-testid="button-race-reset"
              className="flex h-10 items-center gap-2 rounded-lg border border-[hsl(var(--border))] px-4 text-xs font-bold text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
            >
              <RotateCcw className="size-3.5" /> New array
            </button>
          </div>
        </section>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-[180px_1fr_1fr]">
          <label className="rounded-xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card)/.72)] p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-bold">Array size</span>
              <span className="font-mono text-xs text-[hsl(var(--primary))]">{arraySize}</span>
            </div>
            <input
              type="range"
              min="8"
              max="32"
              value={arraySize}
              disabled={isRunning}
              onChange={(event) => {
                const size = Number(event.target.value);
                setArraySize(size);
                reset(size);
              }}
              className="h-1.5 w-full cursor-pointer accent-[hsl(var(--primary))]"
              data-testid="input-race-array-size"
            />
          </label>
          <label className="rounded-xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card)/.72)] p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-bold">Shared speed</span>
              <span className="font-mono text-xs text-[hsl(var(--accent-foreground))]">{speed}/5</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              value={speed}
              onChange={(event) => setSpeed(Number(event.target.value))}
              className="h-1.5 w-full cursor-pointer accent-[hsl(var(--accent))]"
              data-testid="input-race-speed"
            />
          </label>
          <div className="flex items-center gap-3 rounded-xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card)/.72)] p-4 sm:col-span-2 lg:col-span-1">
            {winner ? <Trophy className="size-5 text-[hsl(var(--primary))]" /> : <Flag className="size-5 text-[hsl(var(--muted-foreground))]" />}
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[.15em] text-[hsl(var(--muted-foreground))]">Race result</p>
              <p className="mt-1 text-sm font-bold" data-testid="race-result">
                {winner ? `${getRaceAlgorithm(winner).label} finished first` : 'Waiting for the finish line'}
              </p>
            </div>
          </div>
        </div>

        <div className={`grid gap-5 ${selected.length === 2 ? 'lg:grid-cols-2' : 'lg:grid-cols-2'}`} data-testid="race-panels">
          {selectedDefinitions.map((algorithm) => (
            <RaceAlgorithmPanel
              key={algorithm.id}
              algorithm={algorithm.id}
              values={values}
              speed={speed}
              command={command}
              winner={winner}
              onComplete={handleComplete}
            />
          ))}
        </div>

        <div className="mt-8 flex items-start gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/.5)] p-4 text-xs leading-relaxed text-[hsl(var(--muted-foreground))]">
          {winner ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[hsl(var(--primary))]" /> : <CircleHelp className="mt-0.5 size-4 shrink-0 text-[hsl(var(--primary))]" />}
          <p>
            <span className="font-bold text-[hsl(var(--foreground))]">How to read the race:</span>{' '}
            each panel advances one event at the same delay. Event counts differ
            because each algorithm takes a different path through the same values.
          </p>
        </div>
      </main>
    </div>
  );
}