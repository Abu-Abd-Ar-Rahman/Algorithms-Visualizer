import { Link, useLocation } from 'wouter';

export function AlgorithmTabs() {
  const [location] = useLocation();

  return (
    <nav
      className="flex items-center gap-1 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/.65)] p-1"
      aria-label="Choose an algorithm"
      data-testid="algorithm-tabs"
    >
      <Link
        href="/"
        className={`rounded-lg px-3 py-2 text-[10px] font-extrabold uppercase tracking-[.12em] transition ${
          location === '/'
            ? 'bg-[hsl(var(--secondary))] text-[hsl(var(--card))]'
            : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]'
        }`}
        data-testid="tab-bubble-sort"
      >
        Bubble Sort
      </Link>
      <Link
        href="/merge-sort"
        className={`rounded-lg px-3 py-2 text-[10px] font-extrabold uppercase tracking-[.12em] transition ${
          location === '/merge-sort'
            ? 'bg-[hsl(var(--secondary))] text-[hsl(var(--card))]'
            : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]'
        }`}
        data-testid="tab-merge-sort"
      >
        Merge Sort
      </Link>
      <Link
        href="/quick-sort"
        className={`rounded-lg px-3 py-2 text-[10px] font-extrabold uppercase tracking-[.12em] transition ${
          location === '/quick-sort'
            ? 'bg-[hsl(var(--secondary))] text-[hsl(var(--card))]'
            : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]'
        }`}
        data-testid="tab-quick-sort"
      >
        Quick Sort
      </Link>
      <Link
        href="/heap-sort"
        className={`rounded-lg px-3 py-2 text-[10px] font-extrabold uppercase tracking-[.12em] transition ${
          location === '/heap-sort'
            ? 'bg-[hsl(var(--secondary))] text-[hsl(var(--card))]'
            : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]'
        }`}
        data-testid="tab-heap-sort"
      >
        Heap Sort
      </Link>
    </nav>
  );
}