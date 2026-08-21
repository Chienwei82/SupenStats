import React, { useState, useCallback } from 'react'
import { Header } from './components/layout/Header'
import { ReportTabs, type ReportId } from './components/layout/ReportTabs'
import { WelcomeScreen } from './components/layout/WelcomeScreen'
import { useTheme } from './hooks/useTheme'
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
  const { theme, toggleTheme } = useTheme()

  // Filter states per report — estos son los "draft" (lo que ve el dropdown).
  const [rendFondo, setRendFondo] = useState<FondoTipo | ''>(FONDO_DEFAULT)
  const [rendDates, setRendDates] = useState<DateRange>(DATE_RANGE_DEFAULT)
  // Estados "aplicados": solo cambian al pulsar el botón Consultar.
  const [appliedRend, setAppliedRend] = useState<{ fondo: FondoTipo | ''; dates: DateRange }>({ fondo: FONDO_DEFAULT, dates: DATE_RANGE_DEFAULT })

  const [comFondo, setComFondo] = useState<FondoTipo | ''>(FONDO_DEFAULT)
  const [comDates, setComDates] = useState<DateRange>(COMISION_RANGE)
  const [appliedCom, setAppliedCom] = useState<{ fondo: FondoTipo | ''; dates: DateRange }>({ fondo: FONDO_DEFAULT, dates: COMISION_RANGE })

  const [portFondo, setPortFondo] = useState<FondoTipo | ''>(FONDO_DEFAULT)
  const [portDates, setPortDates] = useState<DateRange>(PORTFOLIO_RANGE)
  const [appliedPort, setAppliedPort] = useState<{ fondo: FondoTipo | ''; dates: DateRange }>({ fondo: FONDO_DEFAULT, dates: PORTFOLIO_RANGE })

  const [afFondo, setAfFondo] = useState<FondoTipo | ''>(FONDO_DEFAULT)
  const [appliedAf, setAppliedAf] = useState<FondoTipo | ''>(FONDO_DEFAULT)

  // Fetchers — wrapped in useCallback with filter dependencies.
  // Usan los estados APPLIED (solo cambian al pulsar Consultar), de modo que
  // el dropdown/selector no dispara refetch hasta que se confirma la consulta.
  const fetchRendimientoCb = useCallback(
    (signal?: AbortSignal) => fetchRendimiento(appliedRend.fondo || undefined, undefined, appliedRend.dates, signal),
    [appliedRend]
  )
  const fetchComisionesCb = useCallback(
    (signal?: AbortSignal) => fetchComisiones(appliedCom.fondo || undefined, appliedCom.dates, signal),
    [appliedCom]
  )
  const fetchPortafolioCb = useCallback(
    (signal?: AbortSignal) => fetchPortafolio(undefined, appliedPort.fondo || undefined, appliedPort.dates, signal),
    [appliedPort]
  )
  const fetchAfiliadosCb = useCallback(
    (signal?: AbortSignal) => fetchAfiliados(undefined, appliedAf || undefined, undefined, signal),
    [appliedAf]
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

  // Estados "aplicados" (solo cambian al pulsar Consultar).
  const [appliedBen, setAppliedBen] = useState<{ fondo: FondoTipo | ''; dates: DateRange }>({ fondo: FONDO_DEFAULT, dates: DATE_RANGE_DEFAULT })
  const [appliedCue, setAppliedCue] = useState<{ fondo: FondoTipo | ''; dates: DateRange }>({ fondo: FONDO_DEFAULT, dates: DATE_RANGE_DEFAULT })
  const [appliedLt, setAppliedLt] = useState<{ entidad: string; dates: DateRange }>({ entidad: '', dates: DATE_RANGE_DEFAULT })
  const [appliedApo, setAppliedApo] = useState<{ fondo: FondoTipo | ''; dates: DateRange }>({ fondo: FONDO_DEFAULT, dates: DATE_RANGE_DEFAULT })
  const [appliedDem, setAppliedDem] = useState<{ fondo: FondoTipo | ''; dates: DateRange }>({ fondo: FONDO_DEFAULT, dates: DATE_RANGE_DEFAULT })
  const [appliedIsin, setAppliedIsin] = useState<FondoTipo | ''>(FONDO_DEFAULT)

  const fetchBeneficiosCb = useCallback(
    (signal?: AbortSignal) => fetchBeneficios(undefined, appliedBen.fondo || undefined, appliedBen.dates, signal),
    [appliedBen]
  )
  const fetchCuentasCb = useCallback(
    (signal?: AbortSignal) => fetchCuentas(undefined, appliedCue.fondo || undefined, appliedCue.dates, signal),
    [appliedCue]
  )
  const fetchLtCb = useCallback(
    (signal?: AbortSignal) => fetchLibreTransferencia(appliedLt.entidad || undefined, appliedLt.dates, signal),
    [appliedLt]
  )
  const fetchAportantesCb = useCallback(
    (signal?: AbortSignal) => fetchAfiliadosAportantes(undefined, appliedApo.fondo || undefined, appliedApo.dates, signal),
    [appliedApo]
  )
  const fetchDemCb = useCallback(
    (signal?: AbortSignal) => fetchAfiliadosDemograficos(undefined, appliedDem.fondo || undefined, appliedDem.dates, signal),
    [appliedDem]
  )
  const fetchIsinCb = useCallback(
    (signal?: AbortSignal) => fetchPortafolioISIN(undefined, appliedIsin || undefined, PORTFOLIO_RANGE, signal),
    [appliedIsin]
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

  // Handlers del botón "Consultar": actualizan los estados APPLIED a partir de
  // los draft. Solo aquí se dispara el refetch (los fetchFn dependen de applied).
  const consultRend = useCallback(() => setAppliedRend({ fondo: rendFondo, dates: rendDates }), [rendFondo, rendDates])
  const consultCom = useCallback(() => setAppliedCom({ fondo: comFondo, dates: comDates }), [comFondo, comDates])
  const consultPort = useCallback(() => setAppliedPort({ fondo: portFondo, dates: portDates }), [portFondo, portDates])
  const consultAf = useCallback(() => setAppliedAf(afFondo), [afFondo])
  const consultBen = useCallback(() => setAppliedBen({ fondo: benFondo, dates: benDates }), [benFondo, benDates])
  const consultCue = useCallback(() => setAppliedCue({ fondo: cueFondo, dates: cueDates }), [cueFondo, cueDates])
  const consultLt = useCallback(() => setAppliedLt({ entidad: ltEntidad, dates: ltDates }), [ltEntidad, ltDates])
  const consultApo = useCallback(() => setAppliedApo({ fondo: apoFondo, dates: apoDates }), [apoFondo, apoDates])
  const consultDem = useCallback(() => setAppliedDem({ fondo: demFondo, dates: demDates }), [demFondo, demDates])
  const consultIsin = useCallback(() => setAppliedIsin(isinFondo), [isinFondo])

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
        onConsult={consultRend}
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
        onConsult={consultCom}
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
        onConsult={consultPort}
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
      <FilterBar fondo={afFondo} onFondoChange={setAfFondo} onConsult={consultAf} />
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
        onConsult={consultPort}
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
      <FilterBar fondo={benFondo} onFondoChange={setBenFondo} dateRange={benDates} onDateRangeChange={setBenDates} onConsult={consultBen} />
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
      <FilterBar fondo={cueFondo} onFondoChange={setCueFondo} dateRange={cueDates} onDateRangeChange={setCueDates} onConsult={consultCue} />
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
        onConsult={consultLt}
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
      <FilterBar fondo={apoFondo} onFondoChange={setApoFondo} dateRange={apoDates} onDateRangeChange={setApoDates} onConsult={consultApo} />
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
      <FilterBar fondo={demFondo} onFondoChange={setDemFondo} dateRange={demDates} onDateRangeChange={setDemDates} onConsult={consultDem} />
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
      <FilterBar fondo={isinFondo} onFondoChange={setIsinFondo} onConsult={consultIsin} />
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
    <div className="min-h-screen bg-gray-50 dark:bg-[#202331]">
      <Header theme={theme} onToggleTheme={toggleTheme} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <ReportTabs active={activeTab} onChange={setActiveTab} />
        <section
          role="tabpanel"
          id={`panel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
          tabIndex={0}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg"
        >
          {views[activeTab]()}
        </section>
      </main>

      <footer className="bg-gray-800 dark:bg-[#1a1d2e] text-gray-300 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs space-y-3">
          <p className="text-gray-400 dark:text-[#a6accd]">
            Datos obtenidos de la API publica de la Superintendencia de Pensiones de Costa Rica (SUPEN)
          </p>
          <div className="border-t border-gray-700 dark:border-[#2b2a3e] pt-3">
            <p className="font-medium text-gray-300 dark:text-[#eeffff]">Proyecto recreativo con fines educativos</p>
            <p className="text-gray-500 dark:text-[#676e95] mt-1">
              Este proyecto no es oficial de la Superintendencia de Pensiones (SUPEN) ni tiene afiliacion alguna con entes gubernamentales. Es un proyecto de codigo abierto creado para practicar desarrollo web y visualizacion de datos.
            </p>
          </div>
          <a
            href="https://github.com/Chienwei82/SupenStats"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-gray-400 dark:text-[#a6accd] hover:text-white dark:hover:text-[#eeffff] transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
