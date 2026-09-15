import { createFileRoute } from '@tanstack/react-router'
import { createReportRoute, validateReportSearch } from './-shared/reportRoute'
import { CuentasChart } from '../components/charts/CuentasChart'
import { fetchCuentas } from '../api/apiService'
import { FILTER_DEFAULTS } from '../constants/filters'
import type { Cuenta } from '../types/supen'

export const Route = createFileRoute('/cuentas')({
  validateSearch: validateReportSearch,
  component: createReportRoute<Cuenta>({
    endpoint: 'cuentas',
    defaults: FILTER_DEFAULTS.standard,
    fetcher: (f, signal) => fetchCuentas(undefined, f.fondo || undefined, f.dates, signal),
    render: data => <CuentasChart data={data} />,
  }),
})
