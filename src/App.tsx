import React, { useState, useCallback } from 'react'
import { Header } from './components/layout/Header'
import { KpiCards } from './components/layout/KpiCards'
import { ReportTabs, type ReportId } from './components/layout/ReportTabs'
import { RendimientoChart } from './components/charts/RendimientoChart'
import { ComisionesChart } from './components/charts/ComisionesChart'
import { PortafolioChart } from './components/charts/PortafolioChart'
import { AfiliadosChart } from './components/charts/AfiliadosChart'
import { ActivosChart } from './components/charts/ActivosChart'
import { FilterBar } from './components/ui/FilterBar'
import { KpiSkeleton, ChartSkeleton, PageLoader, LoadingOverlay } from './components/ui/LoadingSkeleton'
import { ErrorMessage } from './components/ui/ErrorMessage'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import { useSupenData } from './hooks/useSupenData'
import { fetchComisiones, fetchRendimiento, fetchPortafolio, fetchAfiliados } from './api/apiService'
import { FONDO_DEFAULT, DATE_RANGE_DEFAULT, PORTFOLIO_RANGE } from './constants/suppen'
import type { FondoTipo, DateRange } from './types/suppen'

function App() {
  const [activeTab, setActiveTab] = useState<ReportId>('resumen')

  // Filter states per report
  const [rendFondo, setRendFondo] = useState<FondoTipo | ''>(FONDO_DEFAULT)
  const [rendDates, setRendDates] = useState<DateRange>(DATE_RANGE_DEFAULT)

  const [comFondo, setComFondo] = useState<FondoTipo | ''>(FONDO_DEFAULT)
  const [comDates, setComDates] = useState<DateRange>(DATE_RANGE_DEFAULT)

  const [portFondo, setPortFondo] = useState<FondoTipo | ''>(FONDO_DEFAULT)
  const [portDates, setPortDates] = useState<DateRange>(PORTFOLIO_RANGE)

  const [afFondo, setAfFondo] = useState<FondoTipo | ''>(FONDO_DEFAULT)

  const [actFondo, setActFondo] = useState<FondoTipo | ''>(FONDO_DEFAULT)
  const [actDates, setActDates] = useState<DateRange>(PORTFOLIO_RANGE)

  // Fetchers — wrapped in useCallback with filter dependencies
  const fetchRendimientoCb = useCallback(
    () => fetchRendimiento(rendFondo || undefined, undefined, rendDates),
    [rendFondo, rendDates]
  )
  const fetchComisionesCb = useCallback(
    () => fetchComisiones(comFondo || undefined, comDates),
    [comFondo, comDates]
  )
  const fetchPortafolioCb = useCallback(
    () => fetchPortafolio(undefined, portFondo || undefined, portDates),
    [portFondo, portDates]
  )
  const fetchAfiliadosCb = useCallback(
    () => fetchAfiliados(undefined, afFondo || undefined),
    [afFondo]
  )

  const { data: rendimientos, loading: loadingRend, error: errorRend, refetch: refetchRend } = useSupenData(fetchRendimientoCb)
  const { data: comisiones, loading: loadingCom, error: errorCom, refetch: refetchCom } = useSupenData(fetchComisionesCb)
  const { data: portafolio, loading: loadingPort, error: errorPort, refetch: refetchPort } = useSupenData(fetchPortafolioCb)
  const { data: afiliados, loading: loadingAf, error: errorAf, refetch: refetchAf } = useSupenData(fetchAfiliadosCb)

  const isFirstLoad = loadingRend && loadingCom && loadingPort && loadingAf && rendimientos.length === 0

  // ---- Resumen view ----
  const renderResumen = () => {
    const kpiReady = !loadingRend && !loadingCom && !loadingAf
    const kpiError = errorRend || errorCom || errorAf

    return (
      <div className="space-y-8">
        {/* KPIs */}
        {!kpiReady && <KpiSkeleton />}
        {kpiReady && !kpiError && (
          <ErrorBoundary>
            <KpiCards rendimientos={rendimientos} comisiones={comisiones} afiliados={afiliados} />
          </ErrorBoundary>
        )}
        {kpiReady && kpiError && (
          <ErrorMessage message={kpiError} onRetry={() => { refetchRend(); refetchCom(); refetchAf(); }} />
        )}

        {/* Rendimiento */}
        {loadingRend && rendimientos.length === 0 ? <ChartSkeleton /> : !errorRend ? (
          <ErrorBoundary><RendimientoChart data={rendimientos} /></ErrorBoundary>
        ) : (
          <ErrorMessage message={errorRend} onRetry={refetchRend} />
        )}

        {/* Comisiones + Portafolio */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="relative">
            {loadingCom && comisiones.length === 0 ? <ChartSkeleton /> : !errorCom ? (
              <ErrorBoundary><ComisionesChart data={comisiones} /></ErrorBoundary>
            ) : (
              <ErrorMessage message={errorCom} onRetry={refetchCom} />
            )}
          </div>
          <div className="relative">
            {loadingPort && portafolio.length === 0 ? <ChartSkeleton /> : !errorPort ? (
              <ErrorBoundary><PortafolioChart data={portafolio} /></ErrorBoundary>
            ) : (
              <ErrorMessage message={errorPort} onRetry={refetchPort} />
            )}
          </div>
        </div>

        {/* Afiliados + Activos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="relative">
            {loadingAf && afiliados.length === 0 ? <ChartSkeleton /> : !errorAf ? (
              <ErrorBoundary><AfiliadosChart data={afiliados} /></ErrorBoundary>
            ) : (
              <ErrorMessage message={errorAf} onRetry={refetchAf} />
            )}
          </div>
          <div className="relative">
            {loadingPort && portafolio.length === 0 ? <ChartSkeleton /> : !errorPort ? (
              <ErrorBoundary><ActivosChart data={portafolio} /></ErrorBoundary>
            ) : (
              <ErrorMessage message={errorPort} onRetry={refetchPort} />
            )}
          </div>
        </div>
      </div>
    )
  }

  // ---- Individual report views ----
  const renderRendimiento = () => (
    <div className="space-y-4">
      <FilterBar
        fondo={rendFondo}
        onFondoChange={setRendFondo}
        dateRange={rendDates}
        onDateRangeChange={setRendDates}
      />
      <div className="relative">
        {loadingRend && rendimientos.length === 0 ? <ChartSkeleton /> : !errorRend ? (
          <ErrorBoundary><RendimientoChart data={rendimientos} /></ErrorBoundary>
        ) : (
          <ErrorMessage message={errorRend} onRetry={refetchRend} />
        )}
        {loadingRend && rendimientos.length > 0 && <LoadingOverlay />}
      </div>
    </div>
  )

  const renderComisiones = () => (
    <div className="space-y-4">
      <FilterBar
        fondo={comFondo}
        onFondoChange={setComFondo}
        dateRange={comDates}
        onDateRangeChange={setComDates}
      />
      <div className="relative">
        {loadingCom && comisiones.length === 0 ? <ChartSkeleton /> : !errorCom ? (
          <ErrorBoundary><ComisionesChart data={comisiones} /></ErrorBoundary>
        ) : (
          <ErrorMessage message={errorCom} onRetry={refetchCom} />
        )}
        {loadingCom && comisiones.length > 0 && <LoadingOverlay />}
      </div>
    </div>
  )

  const renderPortafolio = () => (
    <div className="space-y-4">
      <FilterBar
        fondo={portFondo}
        onFondoChange={setPortFondo}
        dateRange={portDates}
        onDateRangeChange={setPortDates}
      />
      <div className="relative">
        {loadingPort && portafolio.length === 0 ? <ChartSkeleton /> : !errorPort ? (
          <ErrorBoundary><PortafolioChart data={portafolio} /></ErrorBoundary>
        ) : (
          <ErrorMessage message={errorPort} onRetry={refetchPort} />
        )}
        {loadingPort && portafolio.length > 0 && <LoadingOverlay />}
      </div>
    </div>
  )

  const renderAfiliados = () => (
    <div className="space-y-4">
      <FilterBar fondo={afFondo} onFondoChange={setAfFondo} />
      <div className="relative">
        {loadingAf && afiliados.length === 0 ? <ChartSkeleton /> : !errorAf ? (
          <ErrorBoundary><AfiliadosChart data={afiliados} /></ErrorBoundary>
        ) : (
          <ErrorMessage message={errorAf} onRetry={refetchAf} />
        )}
        {loadingAf && afiliados.length > 0 && <LoadingOverlay />}
      </div>
    </div>
  )

  const renderActivos = () => (
    <div className="space-y-4">
      <FilterBar
        fondo={actFondo}
        onFondoChange={setActFondo}
        dateRange={actDates}
        onDateRangeChange={setActDates}
      />
      <div className="relative">
        {loadingPort && portafolio.length === 0 ? <ChartSkeleton /> : !errorPort ? (
          <ErrorBoundary><ActivosChart data={portafolio} /></ErrorBoundary>
        ) : (
          <ErrorMessage message={errorPort} onRetry={refetchPort} />
        )}
        {loadingPort && portafolio.length > 0 && <LoadingOverlay />}
      </div>
    </div>
  )

  const views: Record<ReportId, () => React.ReactNode> = {
    resumen: renderResumen,
    rendimiento: renderRendimiento,
    comisiones: renderComisiones,
    portafolio: renderPortafolio,
    afiliados: renderAfiliados,
    activos: renderActivos,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {isFirstLoad && <PageLoader />}

      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <ReportTabs active={activeTab} onChange={setActiveTab} />
        {views[activeTab]()}
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
