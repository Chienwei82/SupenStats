import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { sortByDateAsc, groupBy, getUniqueValues, formatDateShort, formatNumber } from '../../utils/dataTransformers'
import { OPC_COLORS } from '../../constants/suppen'
import { ChartNote } from '../ui/ChartNote'
import type { Afiliado } from '../../types/suppen'

interface Props {
  data: Afiliado[]
}

export function AfiliadosChart({ data }: Props) {
  const sorted = sortByDateAsc(data, 'FechaCorte')
  const entities = getUniqueValues(data, 'Entidad')
  const grouped = groupBy(data, 'Entidad')
  const uniqueDates = getUniqueValues(sorted, 'FechaCorte')

  const chartData = uniqueDates.map(fecha => {
    const point: Record<string, string | number> = { fecha: formatDateShort(fecha) }
    entities.forEach(ent => {
      const match = grouped[ent]?.find((a: Afiliado) => a.FechaCorte === fecha)
      if (match?.CantidadAfiliados != null) {
        point[ent] = match.CantidadAfiliados
      }
    })
    return point
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tooltipFormatter = (value: any, name: any) => [formatNumber(Number(value)), name]

  return (
    <div className="bg-white dark:bg-[#25293c] rounded-xl border border-gray-200 dark:border-[#34324a] p-6 shadow-md dark:shadow-xl dark:shadow-black/30">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-[#eeffff] mb-4">Evolucion de Afiliados por OPC</h3>
      <ResponsiveContainer width="100%" height={350}>
        <AreaChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="fecha" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => formatNumber(v)} />
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
            <Area
              key={ent}
              type="monotone"
              dataKey={ent}
              stroke={OPC_COLORS[ent] || '#6b7280'}
              fill={OPC_COLORS[ent] || '#6b7280'}
              fillOpacity={0.1}
              strokeWidth={2}
              dot={false}
              connectNulls
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
      <ChartNote noteId="afiliados" />
    </div>
  )
}
