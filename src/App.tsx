import { useCallback } from 'react'
import { Header } from './components/layout/Header'
import { KpiCards } from './components/layout/KpiCards'
import { RendimientoChart } from './components/charts/RendimientoChart'
import { ComisionesChart } from './components/charts/ComisionesChart'
import { PortafolioChart } from './components/charts/PortafolioChart'
import { AfiliadosChart } from './components/charts/AfiliadosChart'
import { ActivosChart } from './components/charts/ActivosChart'
import { ChartSkeleton } from './components/ui/LoadingSkeleton'
import { ErrorMessage } from './components/ui/ErrorMessage'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import { useSupenData } from './hooks/useSupenData'
import { fetchComisiones, fetchRendimiento, fetchPortafolio, fetchAfiliados } from './api/apiService'
import { FONDO_DEFAULT, DATE_RANGE_DEFAULT, PORTFOLIO_RANGE } from './constants/suppen'

function App() {
  const fetchRendimientoCb = useCallback(
    () => fetchRendimiento(FONDO_DEFAULT, undefined, DATE_RANGE_DEFAULT),
    []
  )
  const fetchComisionesCb = useCallback(
    () => fetchComisiones(FONDO_DEFAULT, DATE_RANGE_DEFAULT),
    []
  )
  const fetchPortafolioCb = useCallback(
    () => fetchPortafolio(undefined, FONDO_DEFAULT, PORTFOLIO_RANGE),
    []
  )
  const fetchAfiliadosCb = useCallback(
    () => fetchAfiliados(undefined, FONDO_DEFAULT),
    []
  )

  const { data: rendimientos, loading: loadingRend, error: errorRend, refetch: refetchRend } = useSupenData(fetchRendimientoCb)
  const { data: comisiones, loading: loadingCom, error: errorCom, refetch: refetchCom } = useSupenData(fetchComisionesCb)
  const { data: portafolio, loading: loadingPort, error: errorPort, refetch: refetchPort } = useSupenData(fetchPortafolioCb)
  const { data: afiliados, loading: loadingAf, error: errorAf, refetch: refetchAf } = useSupenData(fetchAfiliadosCb)

  // Cada sección maneja su propio estado de carga/error de forma independiente,
  // para que los gráficos rápidos se muestren mientras el portafolio (lento)
  // sigue cargando.
  const kpiReady = !loadingRend && !loadingCom && !loadingAf
  const kpiError = errorRend || errorCom || errorAf

  const rendimientoReady = !loadingRend
  const comisionReady = !loadingCom
  const portafolioReady = !loadingPort
  const afiliadoReady = !loadingAf

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {kpiReady && !kpiError && (
          <ErrorBoundary>
            <KpiCards
              rendimientos={rendimientos}
              comisiones={comisiones}
              afiliados={afiliados}
            />
          </ErrorBoundary>
        )}

        {kpiReady && kpiError && (
          <ErrorMessage
            message={kpiError}
            onRetry={() => { refetchRend(); refetchCom(); refetchAf(); }}
          />
        )}

        {!kpiReady && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
                <div className="h-3 bg-gray-200 rounded w-2/3 mb-3" />
                <div className="h-6 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {rendimientoReady && !errorRend && (
          <ErrorBoundary>
            <RendimientoChart data={rendimientos} />
          </ErrorBoundary>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {comisionReady && !errorCom ? (
            <ErrorBoundary>
              <ComisionesChart data={comisiones} />
            </ErrorBoundary>
          ) : (
            <ChartSkeleton />
          )}

          {portafolioReady && !errorPort ? (
            <ErrorBoundary>
              <PortafolioChart data={portafolio} />
            </ErrorBoundary>
          ) : errorPort ? (
            <ErrorMessage message={errorPort} onRetry={refetchPort} />
          ) : (
            <ChartSkeleton />
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {afiliadoReady && !errorAf ? (
            <ErrorBoundary>
              <AfiliadosChart data={afiliados} />
            </ErrorBoundary>
          ) : (
            <ChartSkeleton />
          )}

          {portafolioReady && !errorPort ? (
            <ErrorBoundary>
              <ActivosChart data={portafolio} />
            </ErrorBoundary>
          ) : errorPort ? (
            <ErrorMessage message={errorPort} onRetry={refetchPort} />
          ) : (
            <ChartSkeleton />
          )}
        </div>
      </main>

      <footer className="bg-gray-100 border-t border-gray-200 py-4 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
          Datos obtenidos de la API publica de la Superintendencia de Pensiones de Costa Rica (SUPEN)
        </div>
      </footer>
    </div>
  )
}

export default App
