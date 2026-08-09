import { useRef, useState } from 'react';
import {
  cellKey,
  runPathfinding,
  type Cell,
  type PathfindingAlgorithm,
} from '@/algorithms/pathfinding';

const ROWS = 15;
const COLS = 25;

const DEFAULT_START: Cell = {
  row: 7,
  col: 4,
};

const DEFAULT_END: Cell = {
  row: 7,
  col: 20,
};

type DrawMode = 'start' | 'end' | 'wall' | 'erase';

function createEmptyWalls(): Set<string> {
  return new Set();
}

function createRandomWalls(
  start: Cell,
  end: Cell,
): Set<string> {
  const walls = new Set<string>();

  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const isStart =
        row === start.row && col === start.col;

      const isEnd =
        row === end.row && col === end.col;

      if (!isStart && !isEnd && Math.random() < 0.28) {
        walls.add(cellKey(row, col));
      }
    }
  }

  return walls;
}

function delayFromSpeed(speed: number): number {
  return 110 - speed * 10;
}

export default function PathfindingPage() {
  const [start, setStart] = useState<Cell>(DEFAULT_START);
  const [end, setEnd] = useState<Cell>(DEFAULT_END);

  const [walls, setWalls] = useState<Set<string>>(
    createEmptyWalls,
  );

  const [drawMode, setDrawMode] =
    useState<DrawMode>('start');

  const [algorithm, setAlgorithm] =
    useState<PathfindingAlgorithm>('dijkstra');

  const [speed, setSpeed] = useState(6);

  const [visited, setVisited] = useState<Set<string>>(
    new Set(),
  );

  const [path, setPath] = useState<Set<string>>(
    new Set(),
  );

  const [visitedCount, setVisitedCount] = useState(0);

  const [status, setStatus] = useState('Ready');

  const [pathLength, setPathLength] =
    useState<number | null>(null);

  const [running, setRunning] = useState(false);

  const pointerDown = useRef(false);
  const runId = useRef(0);

  function clearVisualization() {
    runId.current += 1;
    setVisited(new Set());
    setPath(new Set());
    setVisitedCount(0);
    setPathLength(null);
    setStatus('Ready');
    setRunning(false);
  }

  function handleCell(row: number, col: number) {
    if (running) return;

    const key = cellKey(row, col);

    if (drawMode === 'start') {
      if (row === end.row && col === end.col) return;

      setStart({ row, col });

      setWalls((previous) => {
        const next = new Set(previous);
        next.delete(key);
        return next;
      });

      clearVisualization();
      return;
    }

    if (drawMode === 'end') {
      if (row === start.row && col === start.col) return;

      setEnd({ row, col });

      setWalls((previous) => {
        const next = new Set(previous);
        next.delete(key);
        return next;
      });

      clearVisualization();
      return;
    }

    if (drawMode === 'wall') {
      if (
        (row === start.row && col === start.col) ||
        (row === end.row && col === end.col)
      ) {
        return;
      }

      setWalls((previous) => {
        const next = new Set(previous);
        next.add(key);
        return next;
      });

      clearVisualization();
      return;
    }

    if (drawMode === 'erase') {
      setWalls((previous) => {
        const next = new Set(previous);
        next.delete(key);
        return next;
      });

      clearVisualization();
    }
  }

  function handlePointerDown(
    row: number,
    col: number,
  ) {
    pointerDown.current = true;
    handleCell(row, col);
  }

  function handlePointerEnter(
    row: number,
    col: number,
  ) {
    if (!pointerDown.current) return;

    if (
      drawMode === 'wall' ||
      drawMode === 'erase'
    ) {
      handleCell(row, col);
    }
  }

  function clearPath() {
    runId.current += 1;
    setVisited(new Set());
    setPath(new Set());
    setVisitedCount(0);
    setPathLength(null);
    setStatus('Ready');
    setRunning(false);
  }

  function resetGrid() {
    runId.current += 1;

    setStart(DEFAULT_START);
    setEnd(DEFAULT_END);
    setWalls(createEmptyWalls());
    setVisited(new Set());
    setPath(new Set());
    setVisitedCount(0);
    setPathLength(null);
    setStatus('Ready');
    setRunning(false);
  }

  function randomWalls() {
    runId.current += 1;

    setWalls(createRandomWalls(start, end));
    setVisited(new Set());
    setPath(new Set());
    setVisitedCount(0);
    setPathLength(null);
    setStatus('Ready');
    setRunning(false);
  }

  async function run() {
    if (running) return;

    const currentRun = ++runId.current;

    setRunning(true);
    setVisited(new Set());
    setPath(new Set());
    setVisitedCount(0);
    setPathLength(null);

    setStatus(
      algorithm === 'dijkstra'
        ? "Running Dijkstra's..."
        : 'Running A*...',
    );

    const result = runPathfinding(
      algorithm,
      start,
      end,
      ROWS,
      COLS,
      walls,
    );

    const delay = delayFromSpeed(speed);

    const visitedCells = new Set<string>();

    for (const key of result.visitedOrder) {
      if (currentRun !== runId.current) return;

      visitedCells.add(key);
      setVisited(new Set(visitedCells));
      setVisitedCount(visitedCells.size);

      await new Promise((resolve) =>
        setTimeout(resolve, delay),
      );
    }

    if (currentRun !== runId.current) return;

    if (!result.found) {
      setStatus('No path exists');
      setPathLength(null);
      setRunning(false);
      return;
    }

    const pathCells = new Set<string>();

    for (const key of result.path) {
      if (currentRun !== runId.current) return;

      pathCells.add(key);
      setPath(new Set(pathCells));

      await new Promise((resolve) =>
        setTimeout(resolve, Math.max(20, delay / 2)),
      );
    }

    if (currentRun !== runId.current) return;

    setPathLength(result.path.length);
    setStatus('Path found');
    setRunning(false);
  }

  function cellClass(row: number, col: number): string {
    const key = cellKey(row, col);

    const isStart =
      row === start.row && col === start.col;

    const isEnd =
      row === end.row && col === end.col;

    if (isStart) {
      return 'bg-[hsl(var(--primary))]';
    }

    if (isEnd) {
      return 'bg-[hsl(var(--accent))]';
    }

    if (path.has(key)) {
      return 'bg-[hsl(var(--accent))]';
    }

    if (visited.has(key)) {
      return 'bg-[hsl(var(--muted-foreground)/.25)]';
    }

    if (walls.has(key)) {
      return 'bg-[hsl(var(--foreground))]';
    }

    return 'bg-[hsl(var(--background))]';
  }

  const modes: Array<{
    value: DrawMode;
    label: string;
  }> = [
    { value: 'start', label: 'Start' },
    { value: 'end', label: 'End' },
    { value: 'wall', label: 'Wall' },
    { value: 'erase', label: 'Erase' },
  ];

  return (
    <div
      className="grain min-h-[100dvh] bg-[hsl(var(--background))]"
      onPointerUp={() => {
        pointerDown.current = false;
      }}
      onPointerCancel={() => {
        pointerDown.current = false;
      }}
    >
      <main className="mx-auto max-w-[1320px] px-5 pb-14 pt-9 sm:px-8 lg:px-10 lg:pt-14">
        <div className="mb-8 max-w-3xl">
          <div className="mb-4 text-[10px] font-extrabold uppercase tracking-[.2em] text-[hsl(var(--primary))]">
            Pathfinding
          </div>

          <h1 className="text-4xl font-extrabold leading-[.98] tracking-[-.07em] sm:text-6xl">
            Dijkstra & A*
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-[hsl(var(--muted-foreground))] sm:text-base">
            Draw a grid, place walls, and compare how Dijkstra's
            algorithm and A* search explore the same shortest-path
            problem.
          </p>
        </div>

        <div className="mb-5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/.6)] p-4">
          <div className="flex flex-wrap items-center gap-2">
            {modes.map((mode) => (
              <button
                key={mode.value}
                type="button"
                disabled={running}
                onClick={() => setDrawMode(mode.value)}
                className={`rounded-lg border px-3 py-2 text-xs font-bold transition ${
                  drawMode === mode.value
                    ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-white'
                    : 'border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]'
                }`}
              >
                {mode.label}
              </button>
            ))}

            <button
              type="button"
              disabled={running}
              onClick={randomWalls}
              className="rounded-lg border border-[hsl(var(--border))] px-3 py-2 text-xs font-bold hover:bg-[hsl(var(--muted))]"
            >
              Random Walls
            </button>

            <button
              type="button"
              disabled={running}
              onClick={clearPath}
              className="rounded-lg border border-[hsl(var(--border))] px-3 py-2 text-xs font-bold hover:bg-[hsl(var(--muted))]"
            >
              Clear Path
            </button>

            <button
              type="button"
              disabled={running}
              onClick={resetGrid}
              className="rounded-lg border border-[hsl(var(--border))] px-3 py-2 text-xs font-bold hover:bg-[hsl(var(--muted))]"
            >
              Reset Grid
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-5">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold">
                Algorithm
              </span>

              <select
                value={algorithm}
                disabled={running}
                onChange={(event) =>
                  setAlgorithm(
                    event.target.value as PathfindingAlgorithm,
                  )
                }
                className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2"
              >
                <option value="dijkstra">
                  Dijkstra's
                </option>
                <option value="astar">A*</option>
              </select>
            </div>

            <label className="flex items-center gap-2 text-xs">
              <span className="font-semibold">
                Speed
              </span>

              <input
                type="range"
                min="1"
                max="10"
                value={speed}
                onChange={(event) =>
                  setSpeed(Number(event.target.value))
                }
              />
            </label>

            <button
              type="button"
              disabled={running}
              onClick={run}
              className="rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-xs font-bold text-white"
            >
              Run {algorithm === 'dijkstra' ? "Dijkstra's" : 'A*'}
            </button>
          </div>
        </div>

        <div className="mb-5 flex flex-wrap gap-6 font-mono text-xs text-[hsl(var(--muted-foreground))]">
          <div>
            Cells visited:{' '}
            <strong className="text-[hsl(var(--foreground))]">
              {visitedCount}
            </strong>
          </div>

          <div>
            Path length:{' '}
            <strong className="text-[hsl(var(--foreground))]">
              {pathLength ?? '—'}
            </strong>
          </div>

          <div>
            Status:{' '}
            <strong className="text-[hsl(var(--foreground))]">
              {status}
            </strong>
          </div>
        </div>

        <div
          className="grid select-none gap-px overflow-hidden rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--border))]"
          style={{
            gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
            touchAction: 'none',
          }}
        >
          {Array.from({ length: ROWS * COLS }).map(
            (_, index) => {
              const row = Math.floor(index / COLS);
              const col = index % COLS;

              return (
                <button
                  key={cellKey(row, col)}
                  type="button"
                  aria-label={`Row ${row + 1}, column ${col + 1}`}
                  className={`aspect-square w-full ${cellClass(
                    row,
                    col,
                  )} transition-colors duration-150`}
                  onPointerDown={(event) => {
                    event.preventDefault();
                    handlePointerDown(row, col);
                  }}
                  onPointerEnter={() =>
                    handlePointerEnter(row, col)
                  }
                />
              );
            },
          )}
        </div>

        <div className="mt-5 flex flex-wrap gap-5 font-mono text-xs text-[hsl(var(--muted-foreground))]">
          <span className="flex items-center gap-2">
            <span className="size-3 rounded-sm bg-[hsl(var(--primary))]" />
            Start
          </span>

          <span className="flex items-center gap-2">
            <span className="size-3 rounded-sm bg-[hsl(var(--accent))]" />
            End / Path
          </span>

          <span className="flex items-center gap-2">
            <span className="size-3 rounded-sm bg-[hsl(var(--foreground))]" />
            Wall
          </span>

          <span className="flex items-center gap-2">
            <span className="size-3 rounded-sm bg-[hsl(var(--muted-foreground)/.25)]" />
            Visited
          </span>
        </div>
      </main>
    </div>
  );
}
export default function PathfindingPage() {