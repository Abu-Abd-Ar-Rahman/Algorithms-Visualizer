---
name: Algorithm visualization architecture
description: Durable design decisions for extending the algorithm visualizer beyond array sorting.
---

The visualizer should treat algorithms as producers of typed events, keep event application/playback independent from React rendering, and let renderers interpret algorithm-specific state.

**Why:** Array sorting and graph/pathfinding algorithms need different event payloads; a single array-index event shape or UI-owned playback logic will become brittle as the project grows.

**How to apply:** Add new algorithms through strongly typed event contracts and the shared playback layer where behavior is generic. Add specialized state/rendering only when an algorithm family needs it.