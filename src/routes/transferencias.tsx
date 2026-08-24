import { createFileRoute } from '@tanstack/react-router'
import { createReportRoute, validateReportSearch } from './-shared/reportRoute'
import { TransferenciasChart } from '../components/charts/TransferenciasChart'
import { fetchLibreTransferencia } from '../api/apiService'
import { FILTER_DEFAULTS } from '../constants/filters'
import { LT_FONDO_OPTIONS } from '../constants/suppen'

// /lt no soporta filtro de entidad (verificado contra la API real);
// Fondo (ROP/FCL/VOLCA/VOLCB/VOLDA/VOLDB) y fechas sí filtran.
export const Route = createFileRoute('/transferencias')({
  validateSearch: validateReportSearch,
  component: createReportRoute({
    endpoint: 'transferencias',
    defaults: FILTER_DEFAULTS.lt,
    fondoOptions: LT_FONDO_OPTIONS,
    fetcher: (f, signal) => fetchLibreTransferencia(f.fondo || undefined, f.dates, signal),
    render: data => <TransferenciasChart data={data as never} />,
  }),
})
