import { createFileRoute } from '@tanstack/react-router'
import { createReportRoute, validateReportSearch } from './-shared/reportRoute'
import { ActivosChart } from '../components/charts/ActivosChart'
import { fetchPortafolio } from '../api/apiService'
import { FILTER_DEFAULTS } from '../constants/filters'

// Comparte endpoint y caché con /portafolio (misma queryKey → misma query).
export const Route = createFileRoute('/activos')({
  validateSearch: validateReportSearch,
  component: createReportRoute({
    endpoint: 'portafolio',
    defaults: FILTER_DEFAULTS.portafolio,
    fetcher: (f, signal) => fetchPortafolio(undefined, f.fondo || undefined, f.dates, signal),
    render: data => <ActivosChart data={data as never} />,
  }),
})
