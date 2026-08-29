import type { ReactNode } from 'react'
import { useSearch } from '@tanstack/react-router'
import { FilterBar } from '../../components/ui/FilterBar'
import { ReportView } from '../../components/ui/ReportView'
import { useReportQuery, useUrlFilters } from '../../hooks/useReportQuery'
import { resolveFilters } from '../../constants/filters'
import type { ReportSearchInput } from '../../constants/filters'
import type { FondoTipo, DateRange } from '../../types/suppen'

interface ReportRouteConfig {
  /** Nombre del endpoint para la queryKey. */
  endpoint: string
  defaults: { fondo: FondoTipo | ''; dates?: DateRange }
  fondoOptions?: { value: FondoTipo | ''; label: string }[]
  /** Fetcher de apiService; recibe los filtros resueltos y el signal. */
  fetcher: (filters: { fondo: FondoTipo | ''; dates?: DateRange }, signal?: AbortSignal) => Promise<unknown[]>
  render: (data: unknown[]) => ReactNode
}

/**
 * validateSearch compartido por todas las rutas de reporte: normaliza los
 * search params de filtros (fondo/fechaInicio/fechaFinal) a strings o
 * undefined. Los defaults se aplican en el componente vía resolveFilters.
 */
export function validateReportSearch(search: Record<string, unknown>): ReportSearchInput {
  return {
    fondo: typeof search.fondo === 'string' ? search.fondo : undefined,
    fechaInicio: typeof search.fechaInicio === 'string' ? search.fechaInicio : undefined,
    fechaFinal: typeof search.fechaFinal === 'string' ? search.fechaFinal : undefined,
    periodicidad: typeof search.periodicidad === 'string' ? search.periodicidad : undefined,
    corte: typeof search.corte === 'string' ? search.corte : undefined,
    metrica: search.metrica === 'real' ? 'real' : search.metrica === 'nominal' ? 'nominal' : undefined,
    entidad: typeof search.entidad === 'string' ? search.entidad : undefined,
    vista: search.vista === 'traslados' ? 'traslados' : search.vista === 'neto' ? 'neto' : undefined,
  }
}

/**
 * Factory que genera el componente de una ruta de reporte: FilterBar con
 * patrón draft/applied sobre search params + useQuery + ReportView.
 * Reemplaza las funciones renderX() que vivían en App.tsx.
 */
export function createReportRoute(config: ReportRouteConfig) {
  return function ReportRoute() {
    const search = useSearch({ strict: false }) as ReportSearchInput
    const applied = resolveFilters(search, config.defaults)
    const filters = useUrlFilters(applied)

    const { data, loading, error, refetch } = useReportQuery(
      [config.endpoint, applied.fondo || null, applied.dates?.FechaInicio ?? null, applied.dates?.FechaFinal ?? null],
      signal => config.fetcher(applied, signal),
    )

    return (
      <section
        role="tabpanel"
        id={`panel-${config.endpoint}`}
        aria-labelledby={`tab-${config.endpoint}`}
        tabIndex={0}
        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg space-y-4"
      >
        <FilterBar
          fondo={filters.draft.fondo}
          onFondoChange={(f: FondoTipo | '') => filters.setDraft(d => ({ ...d, fondo: f }))}
          fondoOptions={config.fondoOptions}
          dateRange={filters.draft.dates}
          onDateRangeChange={(r: DateRange) => filters.setDraft(d => ({ ...d, dates: r }))}
          onConsult={filters.consult}
        />
        <ReportView loading={loading} error={error} dataCount={data.length} onRetry={refetch}>
          {config.render(data)}
        </ReportView>
      </section>
    )
  }
}
