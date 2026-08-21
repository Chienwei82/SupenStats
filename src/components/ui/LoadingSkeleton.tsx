export function ShimmerSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-gray-200 rounded ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
    </div>
  )
}

export function KpiSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
          <ShimmerSkeleton className="h-3 w-2/3 mb-3" />
          <ShimmerSkeleton className="h-7 w-1/2 mb-2" />
          <ShimmerSkeleton className="h-3 w-3/4" />
        </div>
      ))}
    </div>
  )
}

export function ChartSkeleton({ title = true }: { title?: boolean }) {
  return (
    <div className="p-6 bg-white rounded-xl border border-gray-200">
      {title && <ShimmerSkeleton className="h-5 w-1/4 mb-6" />}
      <div className="h-64 bg-gray-50 rounded flex items-end gap-2 px-4 pb-4">
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

export function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-50">
      <div className="relative mb-6">
        <div className="w-16 h-16 border-4 border-blue-200 rounded-full" />
        <div className="absolute inset-0 w-16 h-16 border-4 border-blue-600 rounded-full border-t-transparent animate-spin" />
      </div>
      <p className="text-gray-500 text-sm font-medium animate-pulse">
        Cargando datos de SUPEN...
      </p>
    </div>
  )
}

export function LoadingOverlay({ message = 'Actualizando...' }: { message?: string }) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-blue-600 rounded-full border-t-transparent animate-spin" />
        <span className="text-sm text-gray-600 font-medium">{message}</span>
      </div>
    </div>
  )
}
