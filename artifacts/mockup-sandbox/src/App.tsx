import { useCallback, useMemo, useState, type ReactNode } from 'react';
import {
  Activity,
  BarChart3,
  CheckCircle2,
  CircleHelp,
  GitBranch,
  RotateCcw,
} from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { generateBubbleSortSteps } from '@/algorithms/bubble-sort';
import { AlgorithmTabs } from '@/components/AlgorithmTabs';
import { BarChart } from '@/components/BarChart';
import { ControlPanel } from '@/components/ControlPanel';
import { MetricCard } from '@/components/MetricCard';
import { useVisualizationPlayback } from '@/hooks/use-visualization-playback';

import MergeSortPage from '@/pages/merge-sort';
import QuickSortPage from '@/pages/quick-sort';
import HeapSortPage from '@/pages/heap-sort';
import RaceModePage from '@/pages/race-mode';
import PathfindingPage from '@/pages/pathfinding';
import NotFound from '@/pages/not-found';

import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const DEFAULT_SIZE = 28;

function createArray(size: number): number[] {
  const values = Array.from({ length: size }, (_, index) => {
    const wave =
      Math.sin(index * 1.73) * 25 +
      Math.cos(index * 0.46) * 18;

    return Math.max(
      8,
      Math.min(
        96,
        Math.round(
          52 + wave + ((index * 19) % 17) - 8,
        ),
      ),
    );
  });

  for (
    let index = values.length - 1;
    index > 0;
    index -= 1
  ) {
    const randomIndex = Math.floor(
      Math.random() * (index + 1),
    );

    [values[index], values[randomIndex]] = [
      values[randomIndex],
      values[index],
    ];
  }

  return values;
}

function createRun(size: number) {
  const initialValues = createArray(size);

  return {
    initialValues,
    steps: generateBubbleSortSteps(initialValues),
  };
}

function Home() {
  const [arraySize, setArraySize] =
    useState(DEFAULT_SIZE);

  const [speed, setSpeed] = useState(3);

  const [run, setRun] = useState(() =>
    createRun(DEFAULT_SIZE),
  );

  const playback = useVisualizationPlayback({
    initialValues: run.initialValues,
    steps: run.steps,
    speed,
  });

  const totalComparisons = useMemo(
    () =>
      run.steps.filter(
        (step) => step.type === 'compare',
      ).length,
    [run.steps],
  );

  const progress = run.steps.length
    ? Math.min(
        100,
        Math.round(
          (playback.stepIndex / run.steps.length) *
            100,
        ),
      )
    : 0;

  const reset = useCallback(
    (size = arraySize) => {
      setRun(createRun(size));
    },
    [arraySize],
  );

  return (
    <div className="grain min-h-[100dvh] bg-[hsl(var(--background))]">
      <header className="border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/.92)] backdrop-blur">
        <div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-10">

          <AlgorithmTabs />

          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-xl bg-[hsl(var(--secondary))] text-[hsl(var(--accent))]">
              <BarChart3 className="size-4" />
            </div>

            <div>
              <p className="text-sm font-extrabold tracking-[-.03em]">
                Algorithm Visualizer
              </p>

              <p className="font-mono text-[9px] uppercase tracking-[.18em] text-[hsl(var(--muted-foreground))]">
                Understand the motion
              </p>
            </div>
          </div>

          <div
            className="flex items-center gap-2 rounded-full border border-[hsl(var(--border))] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]"
            data-testid="status-algorithm"
          >
            <span className="size-1.5 rounded-full bg-[hsl(var(--primary))]" />
            Bubble sort / O(n²)
          </div>

        </div>
      </header>

      <main className="mx-auto max-w-[1320px] px-5 pb-14 pt-9 sm:px-8 lg:px-10 lg:pt-14">

        <div className="mb-9 max-w-3xl animate-rise-in">

          <div className="mb-4 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[.2em] text-[hsl(var(--primary))]">
            <Activity className="size-3.5" />
            Execution laboratory
          </div>

          <h1 className="max-w-2xl text-4xl font-extrabold leading-[.98] tracking-[-.07em] text-[hsl(var(--foreground))] sm:text-6xl">
            Watch the algorithm
            <br />
            <span className="text-[hsl(var(--primary))]">
              think in public.
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-sm leading-7 text-[hsl(var(--muted-foreground))] sm:text-base">
            A live, step-by-step look at Bubble Sort.
            Every comparison is visible. Every swap
            leaves a trace. Slow it down until the
            pattern clicks.
          </p>

        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">

          <div className="min-w-0 space-y-5">

            <BarChart
              values={playback.values}
              step={playback.currentStep}
              sorted={playback.sorted}
              status={playback.status}
            />

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

              <MetricCard
                label="Comparisons"
                value={playback.comparisons
                  .toString()
                  .padStart(2, '0')}
                detail={
                  totalComparisons
                    ? `${Math.round(
                        (playback.comparisons /
                          totalComparisons) *
                          100,
                      )}%`
                    : '—'
                }
                testId="metric-comparisons"
              />

              <MetricCard
                label="Swaps"
                value={playback.swaps
                  .toString()
                  .padStart(2, '0')}
                detail={
                  playback.swaps
                    ? 'active'
                    : 'none yet'
                }
                accent="amber"
                testId="metric-swaps"
              />

              <MetricCard
                label="Sorted positions"
                value={
                  playback.sorted.size
                    ? `${Math.min(
                        arraySize,
                        playback.sorted.size,
                      )}`
                    : '—'
                }
                detail={`of ${arraySize}`}
                accent="navy"
                testId="metric-sorted"
              />

              <MetricCard
                label="Complexity"
                value="O(n²)"
                detail="worst case"
                accent="teal"
                testId="metric-complexity"
              />

            </div>

            <div
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card)/.6)] px-4 py-3 text-xs text-[hsl(var(--muted-foreground))]"
              data-testid="status-message"
            >

              <div className="flex items-center gap-2">

                {playback.status === 'complete' ? (
                  <CheckCircle2 className="size-4 text-[hsl(var(--primary))]" />
                ) : playback.status === 'paused' ? (
                  <CircleHelp className="size-4 text-[hsl(var(--accent-foreground))]" />
                ) : (
                  <GitBranch className="size-4 text-[hsl(var(--primary))]" />
                )}

                <span>
                  {playback.status === 'complete'
                    ? 'Array sorted. The largest values have bubbled into place.'
                    : playback.status === 'paused'
                      ? 'Playback is paused. Resume whenever you are ready.'
                      : playback.status === 'running'
                        ? 'Comparing neighboring values…'
                        : 'Ready to run a new pass through the array.'}
                </span>

              </div>

              <span className="font-mono text-[10px] uppercase tracking-[.14em]">
                {progress}% playback
              </span>

            </div>

            <div
              className="h-1 overflow-hidden rounded-full bg-[hsl(var(--muted))]"
              data-testid="progress-bar"
            >
              <div
                className="progress-sheen h-full rounded-full bg-[hsl(var(--primary))] transition-[width] duration-300"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>

          </div>

          <ControlPanel
            arraySize={arraySize}
            speed={speed}
            status={playback.status}
            onArraySizeChange={(size) => {
              setArraySize(size);
              reset(size);
            }}
            onSpeedChange={setSpeed}
            onStart={playback.start}
            onPause={playback.pause}
            onReset={() => reset()}
          />

        </div>

        <section className="mt-12 grid gap-5 border-t border-[hsl(var(--border))] pt-8 sm:grid-cols-[1fr_auto] sm:items-start">

          <div>

            <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[.18em] text-[hsl(var(--muted-foreground))]">
              The idea in one line
            </p>

            <p className="max-w-2xl text-lg font-semibold leading-relaxed tracking-[-.03em] text-[hsl(var(--foreground))]">
              “Keep comparing neighbors, swap if they
              are out of order, and let the biggest
              value drift to the right.”
            </p>

          </div>

          <button
            type="button"
            onClick={() => reset()}
            data-testid="button-regenerate"
            className="flex h-10 items-center gap-2 rounded-lg border border-[hsl(var(--border))] px-4 text-xs font-bold text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
          >
            <RotateCcw className="size-3.5" />
            Fresh data
          </button>

        </section>

      </main>
    </div>
  );
}

function Router() {
  return (
    <Switch>

      <Route
        path="/"
        component={Home}
      />

      <Route
        path="/merge-sort"
        component={() => (
          <MergeSortPage
            createArray={createArray}
          />
        )}
      />

      <Route
        path="/quick-sort"
        component={() => (
          <QuickSortPage
            createArray={createArray}
          />
        )}
      />

      <Route
        path="/heap-sort"
        component={() => (
          <HeapSortPage
            createArray={createArray}
          />
        )}
      />

      <Route
        path="/race"
        component={() => (
          <RaceModePage
            createArray={createArray}
          />
        )}
      />

      <Route
        path="/pathfinding"
        component={PathfindingPage}
      />

      <Route
        component={NotFound}
      />

    </Switch>
  );
}

function RoutedErrorBoundary({
  children,
}: {
  children: ReactNode;
}) {
  const [location] = useLocation();

  return (
    <ErrorBoundary resetKey={location}>
      {children}
    </ErrorBoundary>
  );
}

function App() {
  return (
    <WouterRouter
      base={import.meta.env.BASE_URL.replace(
        /\/$/,
        '',
      )}
    >
      <RoutedErrorBoundary>
        <Router />
      </RoutedErrorBoundary>
    </WouterRouter>
  );
}

export default App;