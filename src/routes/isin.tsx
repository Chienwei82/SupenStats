import { createFileRoute } from '@tanstack/react-router'
import { createReportRoute, validateReportSearch } from './-shared/reportRoute'
import { PortafolioISINChart } from '../components/charts/PortafolioISINChart'
import { fetchPortafolioISIN } from '../api/apiService'
import { FILTER_DEFAULTS } from '../constants/filters'
import { PORTFOLIO_RANGE } from '../constants/suppen'

export const Route = createFileRoute('/isin')({
  validateSearch: validateReportSearch,
  component: createReportRoute({
    endpoint: 'isin',
    defaults: FILTER_DEFAULTS.noDates,
    fetcher: (f, signal) => fetchPortafolioISIN(undefined, f.fondo || undefined, PORTFOLIO_RANGE, signal),
    render: data => <PortafolioISINChart data={data as never} />,
  }),
})
