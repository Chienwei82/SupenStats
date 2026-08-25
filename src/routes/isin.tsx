import { createFileRoute } from '@tanstack/react-router'
import { createReportRoute, validateReportSearch } from './-shared/reportRoute'
import { PortafolioISINChart } from '../components/charts/PortafolioISINChart'
import { fetchPortafolioISIN } from '../api/apiService'
import { FILTER_DEFAULTS } from '../constants/filters'

// El endpoint de portafolioisin es igual de pesado que /portafolio (devuelve
// datos desde 2010 y sin filtro son ~200k registros). Usamos el mismo rango
// por defecto (últimos 3 meses) para que la consulta sea rápida y el gráfico
// muestre la distribución actual.
export const Route = createFileRoute('/isin')({
  validateSearch: validateReportSearch,
  component: createReportRoute({
    endpoint: 'isin',
    defaults: FILTER_DEFAULTS.portafolio,
    fetcher: (f, signal) => fetchPortafolioISIN(undefined, f.fondo || undefined, f.dates, signal),
    render: data => <PortafolioISINChart data={data as never} />,
  }),
})
