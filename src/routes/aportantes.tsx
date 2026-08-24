import { createFileRoute } from '@tanstack/react-router'
import { createReportRoute, validateReportSearch } from './-shared/reportRoute'
import { AportantesChart } from '../components/charts/AportantesChart'
import { fetchAfiliadosAportantes } from '../api/apiService'
import { FILTER_DEFAULTS } from '../constants/filters'

export const Route = createFileRoute('/aportantes')({
  validateSearch: validateReportSearch,
  component: createReportRoute({
    endpoint: 'aportantes',
    defaults: FILTER_DEFAULTS.standard,
    fetcher: (f, signal) => fetchAfiliadosAportantes(undefined, f.fondo || undefined, f.dates, signal),
    render: data => <AportantesChart data={data as never} />,
  }),
})
