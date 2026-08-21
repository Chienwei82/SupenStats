export function LoadingSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />
      <div className="space-y-3">
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-5/6" />
        <div className="h-3 bg-gray-200 rounded w-4/6" />
      </div>
      <div className="mt-6 h-48 bg-gray-200 rounded" />
    </div>
  )
}

export function ChartSkeleton() {
  return (
    <div className="animate-pulse p-6 bg-white rounded-xl border border-gray-200">
      <div className="h-5 bg-gray-200 rounded w-1/4 mb-6" />
      <div className="h-64 bg-gray-100 rounded flex items-end gap-2 px-4 pb-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 bg-gray-200 rounded-t"
            style={{ height: `${20 + Math.random() * 80}%` }}
          />
        ))}
      </div>
    </div>
  )
}
