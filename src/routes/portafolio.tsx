import { createFileRoute } from '@tanstack/react-router'
import { createReportRoute, validateReportSearch } from './-shared/reportRoute'
import { PortafolioChart } from '../components/charts/PortafolioChart'
import { fetchPortafolio } from '../api/apiService'
import { FILTER_DEFAULTS } from '../constants/filters'

// El endpoint de portafolio es muy pesado (55MB sin filtro): el rango por
// defecto se limita a los últimos 3 meses (PORTFOLIO_RANGE).
export const Route = createFileRoute('/portafolio')({
  validateSearch: validateReportSearch,
  component: createReportRoute({
    endpoint: 'portafolio',
    defaults: FILTER_DEFAULTS.portafolio,
    fetcher: (f, signal) => fetchPortafolio(undefined, f.fondo || undefined, f.dates, signal),
    render: data => <PortafolioChart data={data as never} />,
  }),
})
