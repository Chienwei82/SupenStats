import { createFileRoute } from '@tanstack/react-router'
import { createReportRoute, validateReportSearch } from './-shared/reportRoute'
import { CuentasChart } from '../components/charts/CuentasChart'
import { fetchCuentas } from '../api/apiService'
import { FILTER_DEFAULTS } from '../constants/filters'

export const Route = createFileRoute('/cuentas')({
  validateSearch: validateReportSearch,
  component: createReportRoute({
    endpoint: 'cuentas',
    defaults: FILTER_DEFAULTS.standard,
    fetcher: (f, signal) => fetchCuentas(undefined, f.fondo || undefined, f.dates, signal),
    render: data => <CuentasChart data={data as never} />,
  }),
})
