import { createFileRoute, useSearch } from '@tanstack/react-router'
import { validateReportSearch } from './-shared/reportRoute'
import { PiramideChart } from '../components/charts/PiramideChart'
import { fetchAfiliadosDemograficos, fetchBeneficiosDemograficos } from '../api/apiService'
import { FILTER_DEFAULTS, resolveFilters } from '../constants/filters'
import { useReportQuery, useUrlFilters } from '../hooks/useReportQuery'
import { FilterBar } from '../components/ui/FilterBar'
import { ReportView } from '../components/ui/ReportView'
import type { AfiliadoDemografico, BeneficioDemografico } from '../types/supen'

export const Route = createFileRoute('/piramide')({
  validateSearch: validateReportSearch,
  component: PiramidePage,
})

function PiramidePage() {
  const search = useSearch({ strict: false }) as ReturnType<typeof validateReportSearch>
  const applied = resolveFilters(search, FILTER_DEFAULTS.standard)
  const filters = useUrlFilters(applied)

  const { data: afiliados, loading, error, refetch } = useReportQuery<AfiliadoDemografico>(
    ['afiliados-demograficos', applied.fondo || null, applied.dates?.FechaInicio ?? null, applied.dates?.FechaFinal ?? null],
    signal => fetchAfiliadosDemograficos(undefined, applied.fondo || undefined, applied.dates, signal),
  )
  const { data: beneficios } = useReportQuery<BeneficioDemografico>(
    ['beneficios-demograficos', applied.fondo || null, applied.dates?.FechaInicio ?? null, applied.dates?.FechaFinal ?? null],
    signal => fetchBeneficiosDemograficos(undefined, applied.fondo || undefined, applied.dates, signal),
  )

  return (
    <section
      role="tabpanel"
      id="panel-piramide"
      aria-labelledby="tab-piramide"
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
      <ReportView loading={loading} error={error} dataCount={afiliados.length} onRetry={refetch}>
        <PiramideChart afiliados={afiliados} beneficios={beneficios} />
      </ReportView>
    </section>
  )
}
