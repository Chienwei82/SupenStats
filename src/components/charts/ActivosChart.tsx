import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { sortByDateAsc, groupBy, getUniqueValues, formatDateShort, formatCurrencyBillions } from '../../utils/dataTransformers'
import { entityColor } from '../../constants/supen'
import { ChartNote } from '../ui/ChartNote'
import type { Portafolio } from '../../types/supen'

interface Props {
  data: Portafolio[]
}

export function ActivosChart({ data }: Props) {
  const sorted = sortByDateAsc(data, 'FechaCorte')
  const entities = getUniqueValues(data, 'Entidad')
  const grouped = groupBy(data, 'Entidad')
  const uniqueDates = getUniqueValues(sorted, 'FechaCorte')

  const chartData = uniqueDates.map(fecha => {
    const point: Record<string, string | number> = { fecha: formatDateShort(fecha) }
    entities.forEach(ent => {
      const items = grouped[ent]?.filter((p: Portafolio) => p.FechaCorte === fecha) ?? []
      point[ent] = items.reduce((sum, item) => sum + (item.Monto ?? 0), 0)
    })
    return point
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tooltipFormatter = (value: any, name: any) => [formatCurrencyBillions(Number(value)), name]

  return (
    <div className="bg-white dark:bg-[#25293c] rounded-xl border border-gray-200 dark:border-[#34324a] p-6 shadow-md dark:shadow-xl dark:shadow-black/30">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-[#eeffff] mb-4">Activos Netos por Operadora</h3>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="fecha" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => formatCurrencyBillions(v)} />
          <Tooltip
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={tooltipFormatter as any}
            labelFormatter={(label) => `Fecha: ${label}`}
          />
          <Legend
            wrapperStyle={{ fontSize: 11 }}
            formatter={(value) => {
              const s = String(value)
              return s.length > 20 ? `${s.substring(0, 18)}...` : s
            }}
          />
          {entities.map(ent => (
            <Bar
              key={ent}
              dataKey={ent}
              fill={entityColor(ent)}
              radius={[2, 2, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
      <ChartNote noteId="activos" />
    </div>
  )
}
