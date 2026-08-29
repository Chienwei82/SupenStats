import { createFileRoute } from '@tanstack/react-router'
import { validateReportSearch } from './-shared/reportRoute'
import { Traslados } from '../components/Traslados'
import { fetchAfiliadosRaw, fetchLibreTransferenciaMatriz } from '../api/apiService'
import { FILTER_DEFAULTS, resolveFilters } from '../constants/filters'
import { useReportQuery, useUrlFilters } from '../hooks/useReportQuery'
import { FilterBar } from '../components/ui/FilterBar'
import { ReportView } from '../components/ui/ReportView'
import { transformAfiliadosMensual } from '../utils/dataTransformers'
import type { AfiliadoMensual, RawAfiliado, RawLibreTransferencia } from '../types/suppen'

export const Route = createFileRoute('/traslados')({
  validateSearch: validateReportSearch,
  component: TrasladosPage,
})

function TrasladosPage() {
  const search = validateReportSearch({})
  const applied = resolveFilters(search, FILTER_DEFAULTS.standard)
  const filters = useUrlFilters(applied)

  // /afiliado devuelve el desglose demográfico; lo agrupamos por
  // (entidad, fecha, fondo) preservando null para que la variación neta no
  // invente datos donde la API no reportó conteo.
  const { data: afiliadosRaw, loading: loadingAfiliados, error: errorAfiliados, refetch: refetchAfiliados } = useReportQuery<RawAfiliado>(
    ['afiliados-traslados', applied.fondo || null, applied.dates?.FechaInicio ?? null, applied.dates?.FechaFinal ?? null],
    signal => fetchAfiliadosRaw(applied.fondo || undefined, applied.dates, signal),
  )
  const { data: ltMatriz, loading: loadingLT, error: errorLT, refetch: refetchLT } = useReportQuery<RawLibreTransferencia>(
    ['lt-matriz', applied.fondo || null, applied.dates?.FechaInicio ?? null, applied.dates?.FechaFinal ?? null],
    signal => fetchLibreTransferenciaMatriz(applied.fondo || undefined, applied.dates, signal),
  )

  const loading = loadingAfiliados || loadingLT
  const error = errorAfiliados ?? errorLT ?? null
  const refetch = () => { refetchAfiliados(); refetchLT() }

  const afiliados: AfiliadoMensual[] = transformAfiliadosMensual(afiliadosRaw)

  return (
    <section
      role="tabpanel"
      id="panel-traslados"
      aria-labelledby="tab-traslados"
      tabIndex={0}
      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg space-y-4"
    >
      <FilterBar
        fondo={filters.draft.fondo}
        onFondoChange={(f) => filters.setDraft(d => ({ ...d, fondo: f }))}
        dateRange={filters.draft.dates}
        onDateRangeChange={(r) => filters.setDraft(d => ({ ...d, dates: r }))}
        onConsult={filters.consult}
      />
      <ReportView loading={loading} error={error} dataCount={afiliados.length + ltMatriz.length} onRetry={refetch}>
        <Traslados afiliados={afiliados} trasladosMatriz={ltMatriz} />
      </ReportView>
    </section>
  )
}
