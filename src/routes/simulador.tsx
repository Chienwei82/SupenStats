import { createFileRoute } from '@tanstack/react-router'
import { createReportRoute, validateReportSearch } from './-shared/reportRoute'
import { Simulador } from '../components/Simulador'
import { fetchRendimientoSerie } from '../api/apiService'
import { FILTER_DEFAULTS } from '../constants/filters'
import type { RentabilidadSerie } from '../types/supen'

export const Route = createFileRoute('/simulador')({
  validateSearch: validateReportSearch,
  component: createReportRoute({
    endpoint: 'simulador-rentabilidad',
    defaults: FILTER_DEFAULTS.simulador,
    // Trae la serie completa (todas las OPCs); el componente filtra por la OPC
    // seleccionada y calcula el promedio. El rango por defecto (10 años) busca
    // superar MIN_CORTES_RENTABILIDAD.
    fetcher: (f, signal) => fetchRendimientoSerie(f.fondo || undefined, undefined, f.dates, signal),
    render: data => <Simulador data={data as RentabilidadSerie[]} />,
  }),
})
