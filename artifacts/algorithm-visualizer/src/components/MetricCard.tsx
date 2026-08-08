interface MetricCardProps {
  label: string;
  value: string;
  detail: string;
  accent?: 'teal' | 'amber' | 'navy';
  testId: string;
}

export function MetricCard({ label, value, detail, accent = 'teal', testId }: MetricCardProps) {
  const colors = {
    teal: 'bg-[hsl(var(--primary)/.08)] text-[hsl(var(--primary))]',
    amber: 'bg-[hsl(var(--accent)/.18)] text-[hsl(30_66%_32%)]',
    navy: 'bg-[hsl(var(--secondary)/.08)] text-[hsl(var(--secondary))]',
  };
  return (
    <div className="rounded-xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-4" data-testid={testId}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[hsl(var(--muted-foreground))]">{label}</p>
        <span className={`rounded-md px-2 py-1 font-mono text-[10px] font-medium ${colors[accent]}`}>{detail}</span>
      </div>
      <p className="mt-3 font-mono text-3xl font-medium tracking-[-.07em] text-[hsl(var(--foreground))]">{value}</p>
    </div>
  );
}
