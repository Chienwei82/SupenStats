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
import { ReportView } from './components/ui/ReportView'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import { useSupenData } from './hooks/useSupenData'
import { useReportFilters } from './hooks/useReportFilters'
import { fetchComisiones, fetchRendimiento, fetchPortafolio, fetchAfiliados, fetchBeneficios, fetchCuentas, fetchLibreTransferencia, fetchAfiliadosAportantes, fetchAfiliadosDemograficos, fetchPortafolioISIN } from './api/apiService'
import { FONDO_DEFAULT, DATE_RANGE_DEFAULT, PORTFOLIO_RANGE, COMISION_RANGE } from './constants/suppen'
import type { FondoTipo, DateRange } from './types/suppen'

interface FondoFilters {
  fondo: FondoTipo | ''
  dates: DateRange
}

function App() {
  const [activeTab, setActiveTab] = useState<ReportId>('inicio')
  const { theme, toggleTheme } = useTheme()

  // Patrón draft/applied por reporte: el draft alimenta FilterBar y solo al
  // pulsar Consultar se copia a applied, que dispara el refetch.
  const rend = useReportFilters<FondoFilters>({ fondo: FONDO_DEFAULT, dates: DATE_RANGE_DEFAULT })
  const com = useReportFilters<FondoFilters>({ fondo: FONDO_DEFAULT, dates: COMISION_RANGE })
  const port = useReportFilters<FondoFilters>({ fondo: FONDO_DEFAULT, dates: PORTFOLIO_RANGE })
  const af = useReportFilters<{ fondo: FondoTipo | '' }>({ fondo: FONDO_DEFAULT })
  const ben = useReportFilters<FondoFilters>({ fondo: FONDO_DEFAULT, dates: DATE_RANGE_DEFAULT })
  const cue = useReportFilters<FondoFilters>({ fondo: FONDO_DEFAULT, dates: DATE_RANGE_DEFAULT })
  const lt = useReportFilters<{ entidad: string; dates: DateRange }>({ entidad: '', dates: DATE_RANGE_DEFAULT })
  const apo = useReportFilters<FondoFilters>({ fondo: FONDO_DEFAULT, dates: DATE_RANGE_DEFAULT })
  const dem = useReportFilters<FondoFilters>({ fondo: FONDO_DEFAULT, dates: DATE_RANGE_DEFAULT })
  const isinFilters = useReportFilters<{ fondo: FondoTipo | '' }>({ fondo: FONDO_DEFAULT })

  // Fetchers — wrapped in useCallback with filter dependencies.
  // Usan los estados APPLIED (solo cambian al pulsar Consultar), de modo que
  // el dropdown/selector no dispara refetch hasta que se confirma la consulta.
  const fetchRendimientoCb = useCallback(
    (signal?: AbortSignal) => fetchRendimiento(rend.applied.fondo || undefined, undefined, rend.applied.dates, signal),
    [rend.applied]
  )
  const fetchComisionesCb = useCallback(
    (signal?: AbortSignal) => fetchComisiones(com.applied.fondo || undefined, com.applied.dates, signal),
    [com.applied]
  )
  const fetchPortafolioCb = useCallback(
    (signal?: AbortSignal) => fetchPortafolio(undefined, port.applied.fondo || undefined, port.applied.dates, signal),
    [port.applied]
  )
  const fetchAfiliadosCb = useCallback(
    (signal?: AbortSignal) => fetchAfiliados(undefined, af.applied.fondo || undefined, undefined, signal),
    [af.applied]
  )
  const fetchBeneficiosCb = useCallback(
    (signal?: AbortSignal) => fetchBeneficios(undefined, ben.applied.fondo || undefined, ben.applied.dates, signal),
    [ben.applied]
  )
  const fetchCuentasCb = useCallback(
    (signal?: AbortSignal) => fetchCuentas(undefined, cue.applied.fondo || undefined, cue.applied.dates, signal),
    [cue.applied]
  )
  const fetchLtCb = useCallback(
    (signal?: AbortSignal) => fetchLibreTransferencia(lt.applied.entidad || undefined, lt.applied.dates, signal),
    [lt.applied]
  )
  const fetchAportantesCb = useCallback(
    (signal?: AbortSignal) => fetchAfiliadosAportantes(undefined, apo.applied.fondo || undefined, apo.applied.dates, signal),
    [apo.applied]
  )
  const fetchDemCb = useCallback(
    (signal?: AbortSignal) => fetchAfiliadosDemograficos(undefined, dem.applied.fondo || undefined, dem.applied.dates, signal),
    [dem.applied]
  )
  const fetchIsinCb = useCallback(
    (signal?: AbortSignal) => fetchPortafolioISIN(undefined, isinFilters.applied.fondo || undefined, PORTFOLIO_RANGE, signal),
    [isinFilters.applied]
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
        fondo={rend.draft.fondo}
        onFondoChange={f => rend.setDraft(d => ({ ...d, fondo: f }))}
        dateRange={rend.draft.dates}
        onDateRangeChange={r => rend.setDraft(d => ({ ...d, dates: r }))}
        onConsult={rend.consult}
      />
      <ReportView loading={loadingRend} error={errorRend} dataCount={rendimientos.length} onRetry={refetchRend}>
        <RendimientoChart data={rendimientos} />
      </ReportView>
    </div>
  )

  const renderComisiones = () => (
    <div className="space-y-4">
      <FilterBar
        fondo={com.draft.fondo}
        onFondoChange={f => com.setDraft(d => ({ ...d, fondo: f }))}
        dateRange={com.draft.dates}
        onDateRangeChange={r => com.setDraft(d => ({ ...d, dates: r }))}
        onConsult={com.consult}
      />
      <ReportView loading={loadingCom} error={errorCom} dataCount={comisiones.length} onRetry={refetchCom}>
        <ComisionesChart data={comisiones} />
      </ReportView>
    </div>
  )

  const renderPortafolio = () => (
    <div className="space-y-4">
      <FilterBar
        fondo={port.draft.fondo}
        onFondoChange={f => port.setDraft(d => ({ ...d, fondo: f }))}
        dateRange={port.draft.dates}
        onDateRangeChange={r => port.setDraft(d => ({ ...d, dates: r }))}
        onConsult={port.consult}
      />
      <ReportView loading={loadingPort} error={errorPort} dataCount={portafolio.length} onRetry={refetchPort}>
        <PortafolioChart data={portafolio} />
      </ReportView>
    </div>
  )

  const renderAfiliados = () => (
    <div className="space-y-4">
      <FilterBar
        fondo={af.draft.fondo}
        onFondoChange={f => af.setDraft({ fondo: f })}
        onConsult={af.consult}
      />
      <ReportView loading={loadingAf} error={errorAf} dataCount={afiliados.length} onRetry={refetchAf}>
        <AfiliadosChart data={afiliados} />
      </ReportView>
    </div>
  )

  const renderActivos = () => (
    <div className="space-y-4">
      <FilterBar
        fondo={port.draft.fondo}
        onFondoChange={f => port.setDraft(d => ({ ...d, fondo: f }))}
        dateRange={port.draft.dates}
        onDateRangeChange={r => port.setDraft(d => ({ ...d, dates: r }))}
        onConsult={port.consult}
      />
      <ReportView loading={loadingPort} error={errorPort} dataCount={portafolio.length} onRetry={refetchPort}>
        <ActivosChart data={portafolio} />
      </ReportView>
    </div>
  )

  const renderBeneficios = () => (
    <div className="space-y-4">
      <FilterBar
        fondo={ben.draft.fondo}
        onFondoChange={f => ben.setDraft(d => ({ ...d, fondo: f }))}
        dateRange={ben.draft.dates}
        onDateRangeChange={r => ben.setDraft(d => ({ ...d, dates: r }))}
        onConsult={ben.consult}
      />
      <ReportView loading={loadingBen} error={errorBen} dataCount={beneficios.length} onRetry={refetchBen}>
        <BeneficiosChart data={beneficios} />
      </ReportView>
    </div>
  )

  const renderCuentas = () => (
    <div className="space-y-4">
      <FilterBar
        fondo={cue.draft.fondo}
        onFondoChange={f => cue.setDraft(d => ({ ...d, fondo: f }))}
        dateRange={cue.draft.dates}
        onDateRangeChange={r => cue.setDraft(d => ({ ...d, dates: r }))}
        onConsult={cue.consult}
      />
      <ReportView loading={loadingCue} error={errorCue} dataCount={cuentas.length} onRetry={refetchCue}>
        <CuentasChart data={cuentas} />
      </ReportView>
    </div>
  )

  const renderTransferencias = () => (
    <div className="space-y-4">
      <FilterBar
        dateRange={lt.draft.dates}
        onDateRangeChange={r => lt.setDraft(d => ({ ...d, dates: r }))}
        showEntidad
        entidad={lt.draft.entidad}
        onEntidadChange={e => lt.setDraft(d => ({ ...d, entidad: e }))}
        onConsult={lt.consult}
      />
      <ReportView loading={loadingLt} error={errorLt} dataCount={transferencias.length} onRetry={refetchLt}>
        <TransferenciasChart data={transferencias} />
      </ReportView>
    </div>
  )

  const renderAportantes = () => (
    <div className="space-y-4">
      <FilterBar
        fondo={apo.draft.fondo}
        onFondoChange={f => apo.setDraft(d => ({ ...d, fondo: f }))}
        dateRange={apo.draft.dates}
        onDateRangeChange={r => apo.setDraft(d => ({ ...d, dates: r }))}
        onConsult={apo.consult}
      />
      <ReportView loading={loadingApo} error={errorApo} dataCount={aportantes.length} onRetry={refetchApo}>
        <AportantesChart data={aportantes} />
      </ReportView>
    </div>
  )

  const renderDemografia = () => (
    <div className="space-y-4">
      <FilterBar
        fondo={dem.draft.fondo}
        onFondoChange={f => dem.setDraft(d => ({ ...d, fondo: f }))}
        dateRange={dem.draft.dates}
        onDateRangeChange={r => dem.setDraft(d => ({ ...d, dates: r }))}
        onConsult={dem.consult}
      />
      <ReportView loading={loadingDem} error={errorDem} dataCount={demografia.length} onRetry={refetchDem}>
        <DemografiaChart data={demografia} />
      </ReportView>
    </div>
  )

  const renderIsin = () => (
    <div className="space-y-4">
      <FilterBar
        fondo={isinFilters.draft.fondo}
        onFondoChange={f => isinFilters.setDraft({ fondo: f })}
        onConsult={isinFilters.consult}
      />
      <ReportView loading={loadingIsin} error={errorIsin} dataCount={isin.length} onRetry={refetchIsin}>
        <PortafolioISINChart data={isin} />
      </ReportView>
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
