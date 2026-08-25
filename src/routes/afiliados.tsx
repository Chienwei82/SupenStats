import { createFileRoute } from '@tanstack/react-router'
import { createReportRoute, validateReportSearch } from './-shared/reportRoute'
import { AfiliadosChart } from '../components/charts/AfiliadosChart'
import { fetchAfiliados } from '../api/apiService'
import { FILTER_DEFAULTS } from '../constants/filters'

// El endpoint /afiliado devuelve datos desde 2010 y sin filtro de fechas
// descarga ~80k registros. Limitamos al rango estándar (últimos 5 años) para
// que la evolución sea útil y la consulta no sea excesivamente pesada.
export const Route = createFileRoute('/afiliados')({
  validateSearch: validateReportSearch,
  component: createReportRoute({
    endpoint: 'afiliados',
    defaults: FILTER_DEFAULTS.standard,
    fetcher: (f, signal) => fetchAfiliados(undefined, f.fondo || undefined, f.dates, signal),
    render: data => <AfiliadosChart data={data as never} />,
  }),
})
