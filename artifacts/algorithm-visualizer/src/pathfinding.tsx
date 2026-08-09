import { useEffect, useMemo, useRef, useState } from 'react';

type Cell = {
  row: number;
  col: number;
  isWall: boolean;
};

type Point = {
  row: number;
  col: number;
};

type Mode = 'start' | 'end' | 'wall' | 'erase';
type Algorithm = 'dijkstra' | 'astar';

const ROWS = 15;
const COLS = 25;

const INITIAL_START: Point = { row: 7, col: 4 };
const INITIAL_END: Point = { row: 7, col: 20 };

function makeGrid(): Cell[][] {
  return Array.from({ length: ROWS }, (_, row) =>
    Array.from({ length: COLS }, (_, col) => ({
      row,
      col,
      isWall: false,
    })),
  );
}

function cellKey(row: number, col: number): string {
  return `${row}-${col}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function heuristic(
  row: number,
  col: number,
  end: Point,
): number {
  return (
    Math.abs(row - end.row) +
    Math.abs(col - end.col)
  );
}

function getNeighbors(
  row: number,
  col: number,
  grid: Cell[][],
): Point[] {
  const directions = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  const result: Point[] = [];

  for (const [dr, dc] of directions) {
    const nextRow = row + dr;
    const nextCol = col + dc;

    if (
      nextRow >= 0 &&
      nextRow < ROWS &&
      nextCol >= 0 &&
      nextCol < COLS &&
      !grid[nextRow][nextCol].isWall
    ) {
      result.push({
        row: nextRow,
        col: nextCol,
      });
    }
  }

  return result;
}

export default function PathfindingPage() {
  const [grid, setGrid] = useState<Cell[][]>(() =>
    makeGrid(),
  );

  const [start, setStart] =
    useState<Point>(INITIAL_START);

  const [end, setEnd] =
    useState<Point>(INITIAL_END);

  const [mode, setMode] = useState<Mode>('start');
  const [speed, setSpeed] = useState(6);

  const [visited, setVisited] = useState<Set<string>>(
    () => new Set(),
  );

  const [path, setPath] = useState<Set<string>>(
    () => new Set(),
  );

  const [visitedCount, setVisitedCount] = useState(0);

  const [pathLength, setPathLength] = useState<
    number | null
  >(null);

  const [status, setStatus] = useState('Ready');
  const [running, setRunning] = useState(false);

  const mouseDown = useRef(false);

  const delay = useMemo(
    () => 110 - speed * 10,
    [speed],
  );

  useEffect(() => {
    const handleMouseUp = () => {
      mouseDown.current = false;
    };

    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener(
        'mouseup',
        handleMouseUp,
      );
    };
  }, []);

  function clearPath() {
    setVisited(new Set());
    setPath(new Set());
    setVisitedCount(0);
    setPathLength(null);
    setStatus('Ready');
  }

  function resetGrid() {
    setGrid(makeGrid());
    setStart(INITIAL_START);
    setEnd(INITIAL_END);
    clearPath();
  }

  function randomWalls() {
    if (running) return;

    const nextGrid = makeGrid();

    for (let row = 0; row < ROWS; row += 1) {
      for (let col = 0; col < COLS; col += 1) {
        const isStart =
          row === start.row && col === start.col;

        const isEnd =
          row === end.row && col === end.col;

        nextGrid[row][col].isWall =
          !isStart &&
          !isEnd &&
          Math.random() < 0.28;
      }
    }

    setGrid(nextGrid);
    clearPath();
  }

  function handleCell(row: number, col: number) {
    if (running) return;

    const isStart =
      row === start.row && col === start.col;

    const isEnd =
      row === end.row && col === end.col;

    if (mode === 'start') {
      if (isEnd) return;

      setStart({ row, col });

      setGrid((current) =>
        current.map((gridRow) =>
          gridRow.map((cell) =>
            cell.row === row && cell.col === col
              ? { ...cell, isWall: false }
              : cell,
          ),
        ),
      );

      clearPath();
      return;
    }

    if (mode === 'end') {
      if (isStart) return;

      setEnd({ row, col });

      setGrid((current) =>
        current.map((gridRow) =>
          gridRow.map((cell) =>
            cell.row === row && cell.col === col
              ? { ...cell, isWall: false }
              : cell,
          ),
        ),
      );

      clearPath();
      return;
    }

    if (mode === 'wall') {
      if (isStart || isEnd) return;

      setGrid((current) =>
        current.map((gridRow) =>
          gridRow.map((cell) =>
            cell.row === row && cell.col === col
              ? { ...cell, isWall: true }
              : cell,
          ),
        ),
      );

      clearPath();
      return;
    }

    if (mode === 'erase') {
      setGrid((current) =>
        current.map((gridRow) =>
          gridRow.map((cell) =>
            cell.row === row && cell.col === col
              ? { ...cell, isWall: false }
              : cell,
          ),
        ),
      );

      clearPath();
    }
  }

  function handleMouseDown(
    row: number,
    col: number,
  ) {
    mouseDown.current = true;
    handleCell(row, col);
  }

  function handleMouseEnter(
    row: number,
    col: number,
  ) {
    if (mouseDown.current) {
      handleCell(row, col);
    }
  }

  async function runSearch(
    algorithm: Algorithm,
  ) {
    if (running) return;

    setRunning(true);
    setVisited(new Set());
    setPath(new Set());
    setVisitedCount(0);
    setPathLength(null);

    setStatus(
      algorithm === 'astar'
        ? 'Running A*…'
        : 'Running Dijkstra…',
    );

    const distances: Record<string, number> = {};
    const previous: Record<string, string> = {};
    const alreadyVisited = new Set<string>();

    const startKey = cellKey(
      start.row,
      start.col,
    );

    const endKey = cellKey(
      end.row,
      end.col,
    );

    distances[startKey] = 0;

    const open: Array<
      [number, number, number, number]
    > = [
      [
        algorithm === 'astar'
          ? heuristic(start.row, start.col, end)
          : 0,
        0,
        start.row,
        start.col,
      ],
    ];

    let count = 0;
    let found = false;

    while (open.length > 0) {
      open.sort((a, b) => a[0] - b[0]);

      const [, currentDistance, row, col] =
        open.shift()!;

      const currentKey = cellKey(row, col);

      if (alreadyVisited.has(currentKey)) {
        continue;
      }

      alreadyVisited.add(currentKey);
      count += 1;

      setVisited((current) => {
        const next = new Set(current);
        next.add(currentKey);
        return next;
      });

      setVisitedCount(count);

      await sleep(delay);

      if (currentKey === endKey) {
        found = true;
        break;
      }

      for (const neighbor of getNeighbors(
        row,
        col,
        grid,
      )) {
        const neighborKey = cellKey(
          neighbor.row,
          neighbor.col,
        );

        if (alreadyVisited.has(neighborKey)) {
          continue;
        }

        const newDistance =
          currentDistance + 1;

        if (
          distances[neighborKey] === undefined ||
          newDistance < distances[neighborKey]
        ) {
          distances[neighborKey] = newDistance;
          previous[neighborKey] = currentKey;

          const priority =
            newDistance +
            (algorithm === 'astar'
              ? heuristic(
                  neighbor.row,
                  neighbor.col,
                  end,
                )
              : 0);

          open.push([
            priority,
            newDistance,
            neighbor.row,
            neighbor.col,
          ]);
        }
      }
    }

    if (found) {
      const pathKeys: string[] = [];
      let current = endKey;

      while (current !== startKey) {
        pathKeys.push(current);
        current = previous[current];

        if (!current) break;
      }

      pathKeys.reverse();

      const pathSet = new Set<string>();

      for (const key of pathKeys) {
        pathSet.add(key);
        setPath(new Set(pathSet));
        await sleep(Math.max(20, delay / 2));
      }

      setPathLength(pathKeys.length);
      setStatus('Path found');
    } else {
      setStatus('No path exists');
    }

    setRunning(false);
  }

  const modes: Array<[Mode, string]> = [
    ['start', 'Start'],
    ['end', 'End'],
    ['wall', 'Wall'],
    ['erase', 'Erase'],
  ];

  return (
    <div
      className="min-h-[100dvh] px-4 py-8 sm:px-6"
      style={{
        background: '#F6F7F5',
        color: '#1B2430',
      }}
    >
      <div className="mx-auto max-w-[1000px]">
        <div className="mb-6">
          <div
            className="mb-2 font-mono text-xs font-semibold uppercase tracking-[.08em]"
            style={{ color: '#D98E3F' }}
          >
            Pathfinding
          </div>

          <h1 className="font-mono text-3xl font-bold sm:text-4xl">
            Dijkstra & A* Visualizer
          </h1>

          <p
            className="mt-2 max-w-2xl text-sm leading-6"
            style={{ color: '#5A6572' }}
          >
            Pick a mode, draw on the grid, then run
            either algorithm. Compare how many cells
            each algorithm explores to find the same
            shortest path.
          </p>
        </div>

        <div
          className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border bg-white p-3"
          style={{ borderColor: '#DDE1DE' }}
        >
          <div
            className="flex flex-wrap gap-1 rounded-md p-1"
            style={{ background: '#F6F7F5' }}
          >
            {modes.map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setMode(value)}
                disabled={running}
                className="rounded px-3 py-2 font-mono text-xs font-semibold"
                style={{
                  background:
                    mode === value
                      ? '#2D4159'
                      : 'transparent',
                  color:
                    mode === value
                      ? '#FFFFFF'
                      : '#1B2430',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={randomWalls}
            disabled={running}
            className="rounded border px-3 py-2 font-mono text-xs font-semibold"
            style={{ borderColor: '#DDE1DE' }}
          >
            Random Walls
          </button>

          <button
            type="button"
            onClick={clearPath}
            disabled={running}
            className="rounded border px-3 py-2 font-mono text-xs font-semibold"
            style={{ borderColor: '#DDE1DE' }}
          >
            Clear Path
          </button>

          <button
            type="button"
            onClick={resetGrid}
            disabled={running}
            className="rounded border px-3 py-2 font-mono text-xs font-semibold"
            style={{ borderColor: '#DDE1DE' }}
          >
            Reset Grid
          </button>

          <label
            className="ml-1 flex items-center gap-2 font-mono text-xs"
            style={{ color: '#5A6572' }}
          >
            Speed
            <input
              type="range"
              min="1"
              max="10"
              value={speed}
              onChange={(event) =>
                setSpeed(Number(event.target.value))
              }
              disabled={running}
            />
          </label>

          <button
            type="button"
            onClick={() =>
              runSearch('dijkstra')
            }
            disabled={running}
            className="rounded px-3 py-2 font-mono text-xs font-semibold text-white"
            style={{ background: '#2D4159' }}
          >
            Run Dijkstra
          </button>

          <button
            type="button"
            onClick={() =>
              runSearch('astar')
            }
            disabled={running}
            className="rounded px-3 py-2 font-mono text-xs font-semibold text-white"
            style={{ background: '#2D4159' }}
          >
            Run A*
          </button>
        </div>

        <div
          className="mb-4 flex flex-wrap gap-6 font-mono text-xs"
          style={{ color: '#5A6572' }}
        >
          <div>
            Cells visited:{' '}
            <strong style={{ color: '#1B2430' }}>
              {visitedCount}
            </strong>
          </div>

          <div>
            Path length:{' '}
            <strong style={{ color: '#1B2430' }}>
              {pathLength ?? '—'}
            </strong>
          </div>

          <div>
            Status:{' '}
            <strong style={{ color: '#1B2430' }}>
              {status}
            </strong>
          </div>
        </div>

        <div
          className="grid overflow-hidden rounded border"
          style={{
            gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
            gap: '1px',
            background: '#DDE1DE',
            borderColor: '#DDE1DE',
            touchAction: 'none',
          }}
        >
          {grid.flat().map((cell) => {
            const key = cellKey(
              cell.row,
              cell.col,
            );

            const isStart =
              cell.row === start.row &&
              cell.col === start.col;

            const isEnd =
              cell.row === end.row &&
              cell.col === end.col;

            const isPath = path.has(key);
            const isVisited = visited.has(key);

            let background = '#FFFFFF';

            if (cell.isWall) {
              background = '#1B2430';
            } else if (isStart) {
              background = '#3A8B5C';
            } else if (isEnd) {
              background = '#C1443C';
            } else if (isPath) {
              background = '#D98E3F';
            } else if (isVisited) {
              background = '#BFD3E8';
            }

            return (
              <div
                key={key}
                role="button"
                tabIndex={-1}
                aria-label={`Row ${cell.row + 1}, column ${cell.col + 1}`}
                onMouseDown={() =>
                  handleMouseDown(
                    cell.row,
                    cell.col,
                  )
                }
                onMouseEnter={() =>
                  handleMouseEnter(
                    cell.row,
                    cell.col,
                  )
                }
                onTouchStart={(event) => {
                  event.preventDefault();
                  handleCell(
                    cell.row,
                    cell.col,
                  );
                }}
                className="aspect-square"
                style={{
                  background,
                  cursor: running
                    ? 'default'
                    : 'pointer',
                }}
              />
            );
          })}
        </div>

        <div
          className="mt-4 flex flex-wrap gap-4 font-mono text-xs"
          style={{ color: '#5A6572' }}
        >
          <Legend
            color="#3A8B5C"
            label="Start"
          />
          <Legend
            color="#C1443C"
            label="End"
          />
          <Legend
            color="#1B2430"
            label="Wall"
          />
          <Legend
            color="#BFD3E8"
            label="Visited"
          />
          <Legend
            color="#D98E3F"
            label="Shortest path"
          />
        </div>

        <div
          className="mt-8 rounded-lg border bg-white p-4"
          style={{ borderColor: '#DDE1DE' }}
        >
          <h2 className="font-mono text-sm font-bold">
            How the comparison works
          </h2>

          <p
            className="mt-2 text-sm leading-6"
            style={{ color: '#5A6572' }}
          >
            Dijkstra's algorithm uses no heuristic and
            expands outward according to the shortest
            known distance. A* adds the Manhattan-distance
            heuristic, directing its search toward the
            destination while still finding a shortest path
            on this grid.
          </p>
        </div>
      </div>
    </div>
  );
}

function Legend({
  color,
  label,
}: {
  color: string;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className="inline-block size-3 rounded-sm"
        style={{ background: color }}
      />
      {label}
    </span>
  );
}