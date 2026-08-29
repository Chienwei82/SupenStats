import { createFileRoute } from '@tanstack/react-router'
import { createReportRoute, validateReportSearch } from './-shared/reportRoute'
import { ComisionVsRentabilidadChart } from '../components/charts/ComisionVsRentabilidadChart'
import { fetchComisiones, fetchRendimientosComparados } from '../api/apiService'
import { FILTER_DEFAULTS } from '../constants/filters'
import type { ComisionRentabilidadDataset } from '../types/supen'

export const Route = createFileRoute('/comision-rentabilidad')({
  validateSearch: validateReportSearch,
  component: createReportRoute({
    endpoint: 'comision-rentabilidad',
    defaults: FILTER_DEFAULTS.standard,
    // El reporte cruza dos endpoints: componemos ambos en una sola query y
    // devolvemos un único registro con las dos series ya transformadas.
    fetcher: async (f, signal): Promise<ComisionRentabilidadDataset[]> => {
      const [comisiones, rendimientos] = await Promise.all([
        fetchComisiones(f.fondo || undefined, f.dates, signal),
        fetchRendimientosComparados(f.fondo || undefined, f.dates, signal),
      ])
      return [{ comisiones, rendimientos }]
    },
    render: data => <ComisionVsRentabilidadChart data={data as never} />,
  }),
})
