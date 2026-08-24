import { createFileRoute } from '@tanstack/react-router'
import { createReportRoute, validateReportSearch } from './-shared/reportRoute'
import { AfiliadosChart } from '../components/charts/AfiliadosChart'
import { fetchAfiliados } from '../api/apiService'
import { FILTER_DEFAULTS } from '../constants/filters'

export const Route = createFileRoute('/afiliados')({
  validateSearch: validateReportSearch,
  component: createReportRoute({
    endpoint: 'afiliados',
    defaults: FILTER_DEFAULTS.noDates,
    fetcher: (f, signal) => fetchAfiliados(undefined, f.fondo || undefined, undefined, signal),
    render: data => <AfiliadosChart data={data as never} />,
  }),
})
