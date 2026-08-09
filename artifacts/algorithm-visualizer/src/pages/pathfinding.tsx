import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
type Algorithm = 'dijkstra' | 'astar' | 'bfs' | 'dfs';

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

function heuristic(row: number, col: number, end: Point): number {
  return Math.abs(row - end.row) + Math.abs(col - end.col);
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

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function PathfindingPage() {
  const [grid, setGrid] = useState<Cell[][]>(() => makeGrid());
  const [start, setStart] = useState<Point>(INITIAL_START);
  const [end, setEnd] = useState<Point>(INITIAL_END);
  const [mode, setMode] = useState<Mode>('wall');
  const [algorithm, setAlgorithm] =
    useState<Algorithm>('dijkstra');

  const [speed, setSpeed] = useState(6);

  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [path, setPath] = useState<Set<string>>(new Set());

  const [visitedCount, setVisitedCount] = useState(0);
  const [pathLength, setPathLength] =
    useState<number | null>(null);

  const [status, setStatus] = useState('Ready');
  const [running, setRunning] = useState(false);

  const mouseDownRef = useRef(false);

  const delay = useMemo(
    () => 110 - speed * 10,
    [speed],
  );

  const clearPath = useCallback(() => {
    setVisited(new Set());
    setPath(new Set());
    setVisitedCount(0);
    setPathLength(null);
    setStatus('Ready');
  }, []);

  const resetGrid = useCallback(() => {
    setGrid(makeGrid());
    setStart(INITIAL_START);
    setEnd(INITIAL_END);
    clearPath();
  }, [clearPath]);

  const handleCell = useCallback(
    (row: number, col: number) => {
      if (running) return;

      if (mode === 'start') {
        if (row === end.row && col === end.col) return;

        setStart({ row, col });
        clearPath();
        return;
      }

      if (mode === 'end') {
        if (row === start.row && col === start.col) return;

        setEnd({ row, col });
        clearPath();
        return;
      }

      setGrid((current) =>
        current.map((gridRow, r) =>
          gridRow.map((cell, c) => {
            if (r !== row || c !== col) return cell;

            if (
              (r === start.row && c === start.col) ||
              (r === end.row && c === end.col)
            ) {
              return cell;
            }

            return {
              ...cell,
              isWall: mode === 'wall',
            };
          }),
        ),
      );

      clearPath();
    },
    [running, mode, start, end, clearPath],
  );

  const randomWalls = useCallback(() => {
    if (running) return;

    setGrid((current) =>
      current.map((row) =>
        row.map((cell) => {
          const isEndpoint =
            (cell.row === start.row &&
              cell.col === start.col) ||
            (cell.row === end.row &&
              cell.col === end.col);

          return {
            ...cell,
            isWall:
              !isEndpoint && Math.random() < 0.28,
          };
        }),
      ),
    );

    clearPath();
  }, [running, start, end, clearPath]);

  const runSearch = useCallback(
    async (selectedAlgorithm: Algorithm) => {
      if (running) return;

      setRunning(true);
      setVisited(new Set());
      setPath(new Set());
      setVisitedCount(0);
      setPathLength(null);

      const names: Record<Algorithm, string> = {
        dijkstra: 'Dijkstra',
        astar: 'A*',
        bfs: 'BFS',
        dfs: 'DFS',
      };

      setStatus(`Running ${names[selectedAlgorithm]}…`);

      const startKey = cellKey(start.row, start.col);
      const endKey = cellKey(end.row, end.col);

      const previous = new Map<string, string>();
      const visitedKeys = new Set<string>();

      const distances = new Map<string, number>();
      distances.set(startKey, 0);

      let found = false;
      let count = 0;

      if (
        selectedAlgorithm === 'bfs' ||
        selectedAlgorithm === 'dfs'
      ) {
        const collection: Point[] = [
          { row: start.row, col: start.col },
        ];

        while (collection.length > 0) {
          const current =
            selectedAlgorithm === 'bfs'
              ? collection.shift()
              : collection.pop();

          if (!current) break;

          const key = cellKey(current.row, current.col);

          if (visitedKeys.has(key)) continue;

          visitedKeys.add(key);
          count++;

          if (key !== startKey && key !== endKey) {
            setVisited(new Set(visitedKeys));
          }

          setVisitedCount(count);

          if (key === endKey) {
            found = true;
            break;
          }

          const neighbors = getNeighbors(
            current.row,
            current.col,
            grid,
          );

          for (const neighbor of neighbors) {
            const neighborKey = cellKey(
              neighbor.row,
              neighbor.col,
            );

            if (
              !visitedKeys.has(neighborKey) &&
              !previous.has(neighborKey)
            ) {
              previous.set(neighborKey, key);
              collection.push(neighbor);
            }
          }

          await sleep(delay);
        }
      } else {
        let open: Array<{
          priority: number;
          distance: number;
          row: number;
          col: number;
        }> = [
          {
            priority:
              selectedAlgorithm === 'astar'
                ? heuristic(start.row, start.col, end)
                : 0,
            distance: 0,
            row: start.row,
            col: start.col,
          },
        ];

        while (open.length > 0) {
          open.sort((a, b) => a.priority - b.priority);

          const current = open.shift();

          if (!current) break;

          const {
            distance,
            row,
            col,
          } = current;

          const key = cellKey(row, col);

          if (visitedKeys.has(key)) continue;

          visitedKeys.add(key);
          count++;

          if (key !== startKey && key !== endKey) {
            setVisited(new Set(visitedKeys));
          }

          setVisitedCount(count);

          if (key === endKey) {
            found = true;
            break;
          }

          const neighbors = getNeighbors(row, col, grid);

          for (const neighbor of neighbors) {
            const neighborKey = cellKey(
              neighbor.row,
              neighbor.col,
            );

            const newDistance = distance + 1;
            const oldDistance =
              distances.get(neighborKey);

            if (
              oldDistance === undefined ||
              newDistance < oldDistance
            ) {
              distances.set(
                neighborKey,
                newDistance,
              );

              previous.set(
                neighborKey,
                key,
              );

              const priority =
                newDistance +
                (selectedAlgorithm === 'astar'
                  ? heuristic(
                      neighbor.row,
                      neighbor.col,
                      end,
                    )
                  : 0);

              open.push({
                priority,
                distance: newDistance,
                row: neighbor.row,
                col: neighbor.col,
              });
            }
          }

          await sleep(delay);
        }
      }

      if (found) {
        const pathKeys: string[] = [];
        let currentKey = endKey;

        while (currentKey !== startKey) {
          pathKeys.push(currentKey);

          const previousKey =
            previous.get(currentKey);

          if (!previousKey) break;

          currentKey = previousKey;
        }

        pathKeys.reverse();

        const pathSet = new Set<string>();

        for (const key of pathKeys) {
          pathSet.add(key);
          setPath(new Set(pathSet));
          await sleep(Math.max(20, delay / 2));
        }

        setPathLength(pathKeys.length);
        setStatus(`${names[selectedAlgorithm]} found a path`);
      } else {
        setStatus('No path exists');
      }

      setRunning(false);
    },
    [running, start, end, grid, delay],
  );

  useEffect(() => {
    const handleMouseUp = () => {
      mouseDownRef.current = false;
    };

    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener(
        'mouseup',
        handleMouseUp,
      );
    };
  }, []);

  const algorithmNames: Record<Algorithm, string> = {
    dijkstra: 'Dijkstra',
    astar: 'A*',
    bfs: 'BFS',
    dfs: 'DFS',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F6F7F5',
        color: '#1B2430',
        padding: '24px 16px 60px',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: 900,
          margin: '0 auto',
        }}
      >
        <div
          style={{
            color: '#D98E3F',
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          Pathfinding
        </div>

        <h1
          style={{
            fontSize: 'clamp(24px, 6vw, 34px)',
            margin: '8px 0 6px',
          }}
        >
          Pathfinding Visualizer
        </h1>

        <p
          style={{
            color: '#5A6572',
            fontSize: 15,
            marginBottom: 20,
          }}
        >
          Compare Dijkstra, A*, BFS, and DFS as they
          search the grid for a path.
        </p>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            alignItems: 'center',
            marginBottom: 16,
            padding: 14,
            background: '#fff',
            border: '1px solid #DDE1DE',
            borderRadius: 8,
          }}
        >
          {(
            [
              ['start', 'Start'],
              ['end', 'End'],
              ['wall', 'Wall'],
              ['erase', 'Erase'],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              disabled={running}
              onClick={() => setMode(value)}
              style={{
                padding: '8px 12px',
                borderRadius: 5,
                border: '1px solid #DDE1DE',
                background:
                  mode === value
                    ? '#2D4159'
                    : '#fff',
                color:
                  mode === value
                    ? '#fff'
                    : '#1B2430',
                fontWeight: 600,
              }}
            >
              {label}
            </button>
          ))}

          <button
            type="button"
            disabled={running}
            onClick={randomWalls}
          >
            Random Walls
          </button>

          <button
            type="button"
            disabled={running}
            onClick={clearPath}
          >
            Clear Path
          </button>

          <button
            type="button"
            disabled={running}
            onClick={resetGrid}
          >
            Reset Grid
          </button>
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            marginBottom: 16,
          }}
        >
          {(
            [
              ['dijkstra', 'Dijkstra'],
              ['astar', 'A*'],
              ['bfs', 'BFS'],
              ['dfs', 'DFS'],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              disabled={running}
              onClick={() => setAlgorithm(value)}
              style={{
                padding: '9px 14px',
                background:
                  algorithm === value
                    ? '#2D4159'
                    : '#fff',
                color:
                  algorithm === value
                    ? '#fff'
                    : '#1B2430',
                border: '1px solid #DDE1DE',
                borderRadius: 6,
                fontWeight: 600,
              }}
            >
              {label}
            </button>
          ))}

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: '#5A6572',
              fontSize: 13,
            }}
          >
            Speed

            <input
              type="range"
              min="1"
              max="10"
              value={speed}
              disabled={running}
              onChange={(event) =>
                setSpeed(
                  Number(event.target.value),
                )
              }
            />
          </label>

          <button
            type="button"
            disabled={running}
            onClick={() => runSearch(algorithm)}
            style={{
              padding: '9px 16px',
              background: '#2D4159',
              color: '#fff',
              border: '1px solid #2D4159',
              borderRadius: 6,
              fontWeight: 700,
            }}
          >
            Run {algorithmNames[algorithm]}
          </button>
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 20,
            fontSize: 13,
            color: '#5A6572',
            marginBottom: 14,
          }}
        >
          <div>
            Algorithm:{' '}
            <strong>
              {algorithmNames[algorithm]}
            </strong>
          </div>

          <div>
            Cells visited:{' '}
            <strong>{visitedCount}</strong>
          </div>

          <div>
            Path length:{' '}
            <strong>{pathLength ?? '—'}</strong>
          </div>

          <div>
            Status: <strong>{status}</strong>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${COLS}, 1fr)`,
            gap: 1,
            background: '#DDE1DE',
            border: '1px solid #DDE1DE',
            borderRadius: 4,
            overflow: 'hidden',
            touchAction: 'none',
          }}
          onMouseLeave={() => {
            mouseDownRef.current = false;
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

            let background = '#fff';

            if (cell.isWall) {
              background = '#1B2430';
            }

            if (isVisited) {
              background = '#BFD3E8';
            }

            if (isPath) {
              background = '#D98E3F';
            }

            if (isStart) {
              background = '#3A8B5C';
            }

            if (isEnd) {
              background = '#C1443C';
            }

            return (
              <div
                key={key}
                onMouseDown={(event) => {
                  event.preventDefault();
                  mouseDownRef.current = true;

                  handleCell(
                    cell.row,
                    cell.col,
                  );
                }}
                onMouseEnter={() => {
                  if (
                    mouseDownRef.current &&
                    (mode === 'wall' ||
                      mode === 'erase')
                  ) {
                    handleCell(
                      cell.row,
                      cell.col,
                    );
                  }
                }}
                onTouchStart={(event) => {
                  event.preventDefault();

                  handleCell(
                    cell.row,
                    cell.col,
                  );
                }}
                style={{
                  background,
                  aspectRatio: '1',
                  cursor: running
                    ? 'default'
                    : 'pointer',
                }}
                aria-label={`Row ${
                  cell.row + 1
                }, column ${cell.col + 1}`}
              />
            );
          })}
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 14,
            marginTop: 14,
            fontSize: 12,
            color: '#5A6572',
          }}
        >
          <span>
            <i
              style={{
                display: 'inline-block',
                width: 11,
                height: 11,
                background: '#3A8B5C',
                marginRight: 5,
              }}
            />
            Start
          </span>

          <span>
            <i
              style={{
                display: 'inline-block',
                width: 11,
                height: 11,
                background: '#C1443C',
                marginRight: 5,
              }}
            />
            End
          </span>

          <span>
            <i
              style={{
                display: 'inline-block',
                width: 11,
                height: 11,
                background: '#1B2430',
                marginRight: 5,
              }}
            />
            Wall
          </span>

          <span>
            <i
              style={{
                display: 'inline-block',
                width: 11,
                height: 11,
                background: '#BFD3E8',
                marginRight: 5,
              }}
            />
            Visited
          </span>

          <span>
            <i
              style={{
                display: 'inline-block',
                width: 11,
                height: 11,
                background: '#D98E3F',
                marginRight: 5,
              }}
            />
            Shortest path
          </span>
        </div>
      </div>
    </div>
  );
}