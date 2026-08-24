import { createFileRoute } from '@tanstack/react-router'
import { createReportRoute, validateReportSearch } from './-shared/reportRoute'
import { DemografiaChart } from '../components/charts/DemografiaChart'
import { fetchAfiliadosDemograficos } from '../api/apiService'
import { FILTER_DEFAULTS } from '../constants/filters'

export const Route = createFileRoute('/demografia')({
  validateSearch: validateReportSearch,
  component: createReportRoute({
    endpoint: 'demografia',
    defaults: FILTER_DEFAULTS.standard,
    fetcher: (f, signal) => fetchAfiliadosDemograficos(undefined, f.fondo || undefined, f.dates, signal),
    render: data => <DemografiaChart data={data as never} />,
  }),
})
