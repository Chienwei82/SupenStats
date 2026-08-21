export function ShimmerSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-gray-200 rounded ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
    </div>
  )
}

export function ChartSkeleton({ title = true, label = 'Cargando datos del gráfico' }: { title?: boolean; label?: string }) {
  return (
    <div
      className="p-6 bg-white rounded-xl border border-gray-200"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
    >
      {title && <ShimmerSkeleton className="h-5 w-1/4 mb-6" />}
      <div className="h-64 bg-gray-50 rounded flex items-end gap-2 px-4 pb-4" aria-hidden="true">
        {Array.from({ length: 12 }).map((_, i) => (
          <ShimmerSkeleton
            key={i}
            className="flex-1 rounded-t"
            // Use deterministic heights instead of random
          />
        ))}
      </div>
    </div>
  )
}

export function LoadingOverlay({ message = 'Actualizando...' }: { message?: string }) {
  return (
    <div
      className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3">
        <div
          className="w-5 h-5 border-2 border-blue-600 rounded-full border-t-transparent animate-spin"
          aria-hidden="true"
        />
        <span className="text-sm text-gray-600 font-medium">{message}</span>
      </div>
    </div>
  )
}
