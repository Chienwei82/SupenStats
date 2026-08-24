import { createFileRoute } from '@tanstack/react-router'
import { createReportRoute, validateReportSearch } from './-shared/reportRoute'
import { ComisionesChart } from '../components/charts/ComisionesChart'
import { fetchComisiones } from '../api/apiService'
import { FILTER_DEFAULTS } from '../constants/filters'

export const Route = createFileRoute('/comisiones')({
  validateSearch: validateReportSearch,
  component: createReportRoute({
    endpoint: 'comisiones',
    defaults: FILTER_DEFAULTS.comision,
    fetcher: (f, signal) => fetchComisiones(f.fondo || undefined, f.dates, signal),
    render: data => <ComisionesChart data={data as never} />,
  }),
})
