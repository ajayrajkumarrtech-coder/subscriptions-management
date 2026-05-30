export const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800 ${className}`} />
);

export const PlanCardSkeleton = () => (
  <div className="glass-card space-y-4 p-6">
    <Skeleton className="h-6 w-24" />
    <Skeleton className="h-10 w-32" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-4 w-3/5" />
    </div>
    <Skeleton className="h-10 w-full rounded-xl" />
  </div>
);

export const TableRowSkeleton = () => (
  <tr>
    {[...Array(6)].map((_, i) => (
      <td key={i} className="px-4 py-4">
        <Skeleton className="h-4 w-full" />
      </td>
    ))}
  </tr>
);
