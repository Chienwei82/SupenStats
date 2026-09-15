import { createFileRoute } from '@tanstack/react-router'
import { createReportRoute, validateReportSearch } from './-shared/reportRoute'
import { RentabilidadRealChart } from '../components/charts/RentabilidadRealChart'
import { fetchRendimientosComparados } from '../api/apiService'
import { FILTER_DEFAULTS } from '../constants/filters'
import type { RendimientoComparado } from '../types/supen'

export const Route = createFileRoute('/rendimiento-real')({
  validateSearch: validateReportSearch,
  component: createReportRoute<RendimientoComparado>({
    endpoint: 'rendimiento-real',
    defaults: FILTER_DEFAULTS.standard,
    fetcher: (f, signal) => fetchRendimientosComparados(f.fondo || undefined, f.dates, signal),
    render: data => <RentabilidadRealChart data={data} />,
  }),
})
