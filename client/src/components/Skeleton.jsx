export default function Skeleton({ className = '' }) {
  return (
    <div
      className={`skeleton-shimmer relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.065] shadow-2xl shadow-black/10 backdrop-blur-2xl ${className}`}
    />
  );
}

export function SkeletonStack({ rows = 3, className = '' }) {
  return (
    <div className={`grid gap-3 ${className}`}>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-11 w-11 rounded-2xl" />
            <div className="grid flex-1 gap-2">
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="empty-state relative overflow-hidden">
      <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent" />
      {Icon && (
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-[1.5rem] border border-white/10 bg-white/[0.08] text-cyan-300 shadow-2xl shadow-cyan-500/10">
          <Icon size={26} />
        </div>
      )}
      <p className="mt-4 text-lg font-black text-white">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-slate-400">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
