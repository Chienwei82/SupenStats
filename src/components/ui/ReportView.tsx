import type { ReactNode } from 'react'
import { ChartSkeleton, LoadingOverlay } from './LoadingSkeleton'
import { ErrorMessage } from './ErrorMessage'
import { ErrorBoundary } from './ErrorBoundary'

interface ReportViewProps {
  loading: boolean
  error: string | null
  /** Número de items ya cargados; si hay datos previos, el error se muestra como overlay sin descartarlos. */
  dataCount: number
  onRetry: () => void
  children: ReactNode
}

/**
 * Contenedor estándar de un reporte: gestiona los tres estados de carga
 * (primera carga → skeleton, refetch con datos previos → overlay, error).
 * Si hay datos previos y llega un error, se muestran los datos "stale" con el
 * error encima en vez de reemplazar el gráfico por el mensaje de error.
 */
export function ReportView({ loading, error, dataCount, onRetry, children }: ReportViewProps) {
  const hasData = dataCount > 0

  return (
    <div className="relative">
      {loading && !hasData ? (
        <ChartSkeleton />
      ) : !error ? (
        <ErrorBoundary>{children}</ErrorBoundary>
      ) : !hasData ? (
        <ErrorMessage message={error} onRetry={onRetry} />
      ) : (
        <>
          {children}
          <ErrorMessage message={error} onRetry={onRetry} />
        </>
      )}
      {loading && hasData && <LoadingOverlay />}
    </div>
  )
}
