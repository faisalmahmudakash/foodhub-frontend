interface Props {
  label: string;
  value: string;
  hint?: string;
}

export default function StatCard({ label, value, hint }: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1.5 text-2xl font-semibold text-slate-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-slate-200 bg-white px-5 py-4">
      <div className="h-3 w-20 rounded bg-slate-100" />
      <div className="mt-2.5 h-7 w-16 rounded bg-slate-200" />
    </div>
  );
}
