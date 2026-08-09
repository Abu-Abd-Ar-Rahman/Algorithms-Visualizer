# Algorithms Visualizer

An interactive web application for visualizing and comparing fundamental sorting and pathfinding algorithms.

## Live Demo

[Open the live application](YOUR_LIVE_DEMO_URL)

## Features

### Sorting Algorithms

- Bubble Sort
- Merge Sort
- Quick Sort
- Heap Sort
- Sorting Race Mode for comparing algorithms

### Pathfinding Algorithms

- Dijkstra's Algorithm
- A* Search
- Breadth-First Search (BFS)
- Depth-First Search (DFS)

### Sorting Visualization

The sorting visualizer displays the sorting process step by step, allowing users to observe how different algorithms manipulate an array.

Race Mode allows multiple sorting algorithms to run and be compared against each other.

### Pathfinding Visualization

The pathfinding visualizer allows users to create walls, select a start and end point, and observe how different algorithms explore the grid and find a path.

The A* implementation uses the Manhattan distance heuristic:

`h(n) = |x₁ - x₂| + |y₁ - y₂|`

The visualization displays:

- Visited cells
- Explored paths
- Shortest paths
- Walls and obstacles
- Algorithm execution speed

## Algorithms

### Sorting

| Algorithm | Average Time | Worst Time | Space |
|---|---:|---:|---:|
| Bubble Sort | O(n²) | O(n²) | O(1) |
| Merge Sort | O(n log n) | O(n log n) | O(n) |
| Quick Sort | O(n log n) | O(n²) | O(log n) |
| Heap Sort | O(n log n) | O(n log n) | O(1) |

### Pathfinding

| Algorithm | Purpose | Time Complexity |
|---|---|---:|
| Dijkstra's Algorithm | Finds shortest paths | O((V + E) log V) |
| A* Search | Finds a shortest path using a heuristic | Depends on implementation |
| Breadth-First Search (BFS) | Finds shortest paths on an unweighted grid | O(V + E) |
| Depth-First Search (DFS) | Explores paths using depth-first traversal | O(V + E) |

### A* Heuristic

A* uses Manhattan distance as its heuristic:

`h(n) = |x₁ - x₂| + |y₁ - y₂|`

This heuristic is appropriate for the grid-based movement used by the visualizer when movement is restricted to horizontal and vertical directions.

## Technologies

- React
- TypeScript
- Vite
- HTML
- CSS

## Purpose

This project provides an interactive way to understand how common sorting and pathfinding algorithms operate through visual experimentation and comparison.

## Author

Abu Abd Ar-Rahman, ʿAbdullāh 
