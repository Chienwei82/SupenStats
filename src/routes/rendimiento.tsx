import { createFileRoute } from '@tanstack/react-router'
import { createReportRoute, validateReportSearch } from './-shared/reportRoute'
import { RendimientoChart } from '../components/charts/RendimientoChart'
import { fetchRendimiento } from '../api/apiService'
import { FILTER_DEFAULTS } from '../constants/filters'
import type { Rendimiento } from '../types/supen'

export const Route = createFileRoute('/rendimiento')({
  validateSearch: validateReportSearch,
  component: createReportRoute<Rendimiento>({
    endpoint: 'rendimiento',
    defaults: FILTER_DEFAULTS.standard,
    fetcher: (f, signal) => fetchRendimiento(f.fondo || undefined, undefined, f.dates, signal),
    render: data => <RendimientoChart data={data} />,
  }),
})
