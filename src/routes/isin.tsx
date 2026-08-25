import { createFileRoute } from '@tanstack/react-router'
import { createReportRoute, validateReportSearch } from './-shared/reportRoute'
import { PortafolioISINChart } from '../components/charts/PortafolioISINChart'
import { fetchPortafolioISIN } from '../api/apiService'
import { FILTER_DEFAULTS } from '../constants/filters'

// El endpoint de portafolioisin es igual de pesado que /portafolio (devuelve
// datos desde 2010 y sin filtro son ~200k registros). Además SUPEN congeló la
// publicación del detalle por ISIN en 2026-01-31, así que un rango de 3 meses
// reciente devolvía vacío: usamos una ventana de 12 meses (FILTER_DEFAULTS.isin)
// para que el último corte disponible entre en rango.
export const Route = createFileRoute('/isin')({
  validateSearch: validateReportSearch,
  component: createReportRoute({
    endpoint: 'isin',
    defaults: FILTER_DEFAULTS.isin,
    fetcher: (f, signal) => fetchPortafolioISIN(undefined, f.fondo || undefined, f.dates, signal),
    render: data => <PortafolioISINChart data={data as never} />,
  }),
})
