import React, { useState, useCallback } from 'react'
import { Header } from './components/layout/Header'
import { ReportTabs, type ReportId } from './components/layout/ReportTabs'
import { WelcomeScreen } from './components/layout/WelcomeScreen'
import { RendimientoChart } from './components/charts/RendimientoChart'
import { ComisionesChart } from './components/charts/ComisionesChart'
import { PortafolioChart } from './components/charts/PortafolioChart'
import { AfiliadosChart } from './components/charts/AfiliadosChart'
import { ActivosChart } from './components/charts/ActivosChart'
import { BeneficiosChart } from './components/charts/BeneficiosChart'
import { CuentasChart } from './components/charts/CuentasChart'
import { TransferenciasChart } from './components/charts/TransferenciasChart'
import { AportantesChart } from './components/charts/AportantesChart'
import { DemografiaChart } from './components/charts/DemografiaChart'
import { PortafolioISINChart } from './components/charts/PortafolioISINChart'
import { FilterBar } from './components/ui/FilterBar'
import { ChartSkeleton, LoadingOverlay } from './components/ui/LoadingSkeleton'
import { ErrorMessage } from './components/ui/ErrorMessage'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import { useSupenData } from './hooks/useSupenData'
import { fetchComisiones, fetchRendimiento, fetchPortafolio, fetchAfiliados, fetchBeneficios, fetchCuentas, fetchLibreTransferencia, fetchAfiliadosAportantes, fetchAfiliadosDemograficos, fetchPortafolioISIN } from './api/apiService'
import { FONDO_DEFAULT, DATE_RANGE_DEFAULT, PORTFOLIO_RANGE, COMISION_RANGE } from './constants/suppen'
import type { FondoTipo, DateRange } from './types/suppen'

function App() {
  const [activeTab, setActiveTab] = useState<ReportId>('inicio')

  // Filter states per report
  const [rendFondo, setRendFondo] = useState<FondoTipo | ''>(FONDO_DEFAULT)
  const [rendDates, setRendDates] = useState<DateRange>(DATE_RANGE_DEFAULT)

  const [comFondo, setComFondo] = useState<FondoTipo | ''>(FONDO_DEFAULT)
  const [comDates, setComDates] = useState<DateRange>(COMISION_RANGE)

  const [portFondo, setPortFondo] = useState<FondoTipo | ''>(FONDO_DEFAULT)
  const [portDates, setPortDates] = useState<DateRange>(PORTFOLIO_RANGE)

  const [afFondo, setAfFondo] = useState<FondoTipo | ''>(FONDO_DEFAULT)

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

  const [benFondo, setBenFondo] = useState<FondoTipo | ''>(FONDO_DEFAULT)
  const [cueFondo, setCueFondo] = useState<FondoTipo | ''>(FONDO_DEFAULT)
  const [apoFondo, setApoFondo] = useState<FondoTipo | ''>(FONDO_DEFAULT)
  const [demFondo, setDemFondo] = useState<FondoTipo | ''>(FONDO_DEFAULT)
  const [isinFondo, setIsinFondo] = useState<FondoTipo | ''>(FONDO_DEFAULT)

  const [ltEntidad, setLtEntidad] = useState<string>('')
  const [ltDates, setLtDates] = useState<DateRange>(DATE_RANGE_DEFAULT)

  const [benDates, setBenDates] = useState<DateRange>(DATE_RANGE_DEFAULT)
  const [cueDates, setCueDates] = useState<DateRange>(DATE_RANGE_DEFAULT)
  const [apoDates, setApoDates] = useState<DateRange>(DATE_RANGE_DEFAULT)
  const [demDates, setDemDates] = useState<DateRange>(DATE_RANGE_DEFAULT)

  const fetchBeneficiosCb = useCallback(
    () => fetchBeneficios(undefined, benFondo || undefined, benDates),
    [benFondo, benDates]
  )
  const fetchCuentasCb = useCallback(
    () => fetchCuentas(undefined, cueFondo || undefined, cueDates),
    [cueFondo, cueDates]
  )
  const fetchLtCb = useCallback(
    () => fetchLibreTransferencia(ltEntidad || undefined, ltDates),
    [ltEntidad, ltDates]
  )
  const fetchAportantesCb = useCallback(
    () => fetchAfiliadosAportantes(undefined, apoFondo || undefined, apoDates),
    [apoFondo, apoDates]
  )
  const fetchDemCb = useCallback(
    () => fetchAfiliadosDemograficos(undefined, demFondo || undefined, demDates),
    [demFondo, demDates]
  )
  const fetchIsinCb = useCallback(
    () => fetchPortafolioISIN(undefined, isinFondo || undefined, PORTFOLIO_RANGE),
    [isinFondo]
  )

  const { data: beneficios, loading: loadingBen, error: errorBen, refetch: refetchBen } = useSupenData(fetchBeneficiosCb, activeTab === 'beneficios')
  const { data: cuentas, loading: loadingCue, error: errorCue, refetch: refetchCue } = useSupenData(fetchCuentasCb, activeTab === 'cuentas')
  const { data: transferencias, loading: loadingLt, error: errorLt, refetch: refetchLt } = useSupenData(fetchLtCb, activeTab === 'transferencias')
  const { data: aportantes, loading: loadingApo, error: errorApo, refetch: refetchApo } = useSupenData(fetchAportantesCb, activeTab === 'aportantes')
  const { data: demografia, loading: loadingDem, error: errorDem, refetch: refetchDem } = useSupenData(fetchDemCb, activeTab === 'demografia')
  const { data: isin, loading: loadingIsin, error: errorIsin, refetch: refetchIsin } = useSupenData(fetchIsinCb, activeTab === 'isin')

  const { data: rendimientos, loading: loadingRend, error: errorRend, refetch: refetchRend } = useSupenData(fetchRendimientoCb, activeTab === 'rendimiento')
  const { data: comisiones, loading: loadingCom, error: errorCom, refetch: refetchCom } = useSupenData(fetchComisionesCb, activeTab === 'comisiones')
  const { data: portafolio, loading: loadingPort, error: errorPort, refetch: refetchPort } = useSupenData(fetchPortafolioCb, activeTab === 'portafolio' || activeTab === 'activos')
  const { data: afiliados, loading: loadingAf, error: errorAf, refetch: refetchAf } = useSupenData(fetchAfiliadosCb, activeTab === 'afiliados')

  // ---- Pantalla de bienvenida (sin fetch pesado) ----
  const renderInicio = () => (
    <ErrorBoundary>
      <WelcomeScreen />
    </ErrorBoundary>
  )

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
        fondo={portFondo}
        onFondoChange={setPortFondo}
        dateRange={portDates}
        onDateRangeChange={setPortDates}
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

  const renderBeneficios = () => (
    <div className="space-y-4">
      <FilterBar fondo={benFondo} onFondoChange={setBenFondo} dateRange={benDates} onDateRangeChange={setBenDates} />
      <div className="relative">
        {loadingBen && beneficios.length === 0 ? <ChartSkeleton /> : !errorBen ? (
          <ErrorBoundary><BeneficiosChart data={beneficios} /></ErrorBoundary>
        ) : (
          <ErrorMessage message={errorBen} onRetry={refetchBen} />
        )}
        {loadingBen && beneficios.length > 0 && <LoadingOverlay />}
      </div>
    </div>
  )

  const renderCuentas = () => (
    <div className="space-y-4">
      <FilterBar fondo={cueFondo} onFondoChange={setCueFondo} dateRange={cueDates} onDateRangeChange={setCueDates} />
      <div className="relative">
        {loadingCue && cuentas.length === 0 ? <ChartSkeleton /> : !errorCue ? (
          <ErrorBoundary><CuentasChart data={cuentas} /></ErrorBoundary>
        ) : (
          <ErrorMessage message={errorCue} onRetry={refetchCue} />
        )}
        {loadingCue && cuentas.length > 0 && <LoadingOverlay />}
      </div>
    </div>
  )

  const renderTransferencias = () => (
    <div className="space-y-4">
      <FilterBar
        dateRange={ltDates}
        onDateRangeChange={setLtDates}
        showEntidad
        entidad={ltEntidad}
        onEntidadChange={setLtEntidad}
      />
      <div className="relative">
        {loadingLt && transferencias.length === 0 ? <ChartSkeleton /> : !errorLt ? (
          <ErrorBoundary><TransferenciasChart data={transferencias} /></ErrorBoundary>
        ) : (
          <ErrorMessage message={errorLt} onRetry={refetchLt} />
        )}
        {loadingLt && transferencias.length > 0 && <LoadingOverlay />}
      </div>
    </div>
  )

  const renderAportantes = () => (
    <div className="space-y-4">
      <FilterBar fondo={apoFondo} onFondoChange={setApoFondo} dateRange={apoDates} onDateRangeChange={setApoDates} />
      <div className="relative">
        {loadingApo && aportantes.length === 0 ? <ChartSkeleton /> : !errorApo ? (
          <ErrorBoundary><AportantesChart data={aportantes} /></ErrorBoundary>
        ) : (
          <ErrorMessage message={errorApo} onRetry={refetchApo} />
        )}
        {loadingApo && aportantes.length > 0 && <LoadingOverlay />}
      </div>
    </div>
  )

  const renderDemografia = () => (
    <div className="space-y-4">
      <FilterBar fondo={demFondo} onFondoChange={setDemFondo} dateRange={demDates} onDateRangeChange={setDemDates} />
      <div className="relative">
        {loadingDem && demografia.length === 0 ? <ChartSkeleton /> : !errorDem ? (
          <ErrorBoundary><DemografiaChart data={demografia} /></ErrorBoundary>
        ) : (
          <ErrorMessage message={errorDem} onRetry={refetchDem} />
        )}
        {loadingDem && demografia.length > 0 && <LoadingOverlay />}
      </div>
    </div>
  )

  const renderIsin = () => (
    <div className="space-y-4">
      <FilterBar fondo={isinFondo} onFondoChange={setIsinFondo} />
      <div className="relative">
        {loadingIsin && isin.length === 0 ? <ChartSkeleton /> : !errorIsin ? (
          <ErrorBoundary><PortafolioISINChart data={isin} /></ErrorBoundary>
        ) : (
          <ErrorMessage message={errorIsin} onRetry={refetchIsin} />
        )}
        {loadingIsin && isin.length > 0 && <LoadingOverlay />}
      </div>
    </div>
  )

  const views: Record<ReportId, () => React.ReactNode> = {
    inicio: renderInicio,
    rendimiento: renderRendimiento,
    comisiones: renderComisiones,
    portafolio: renderPortafolio,
    afiliados: renderAfiliados,
    activos: renderActivos,
    beneficios: renderBeneficios,
    cuentas: renderCuentas,
    transferencias: renderTransferencias,
    aportantes: renderAportantes,
    demografia: renderDemografia,
    isin: renderIsin,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <ReportTabs active={activeTab} onChange={setActiveTab} />
        {views[activeTab]()}
      </main>

      <footer className="bg-gray-800 text-gray-300 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs space-y-3">
          <p className="text-gray-400">
            Datos obtenidos de la API publica de la Superintendencia de Pensiones de Costa Rica (SUPEN)
          </p>
          <div className="border-t border-gray-700 pt-3">
            <p className="font-medium text-gray-300">Proyecto recreativo con fines educativos</p>
            <p className="text-gray-500 mt-1">
              Este proyecto no es oficial de la Superintendencia de Pensiones (SUPEN) ni tiene afiliacion alguna con entes gubernamentales. Es un proyecto de codigo abierto creado para practicar desarrollo web y visualizacion de datos.
            </p>
          </div>
          <a
            href="https://github.com/Chienwei82/SupenStats"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            Codigo fuente en GitHub
          </a>
        </div>
      </footer>
    </div>
  )
}

export default App
