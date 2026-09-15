import { createFileRoute } from '@tanstack/react-router'
import { createReportRoute, validateReportSearch } from './-shared/reportRoute'
import { BeneficiosChart } from '../components/charts/BeneficiosChart'
import { fetchBeneficios } from '../api/apiService'
import { FILTER_DEFAULTS } from '../constants/filters'
import type { Beneficio } from '../types/supen'

export const Route = createFileRoute('/beneficios')({
  validateSearch: validateReportSearch,
  component: createReportRoute<Beneficio>({
    endpoint: 'beneficios',
    defaults: FILTER_DEFAULTS.standard,
    fetcher: (f, signal) => fetchBeneficios(undefined, f.fondo || undefined, f.dates, signal),
    render: data => <BeneficiosChart data={data} />,
  }),
})
