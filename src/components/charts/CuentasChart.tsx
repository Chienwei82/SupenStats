import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { formatDateShort, formatCurrencyBillions, groupBy, getUniqueValues, sortByDateAsc } from '../../utils/dataTransformers'
import { OPC_COLORS } from '../../constants/suppen'
import type { Cuenta } from '../../types/suppen'

interface Props {
  data: Cuenta[]
}

export function CuentasChart({ data }: Props) {
  // Filtrar solo la categoria que representa activo neto del fondo
  const activoNeto = data.filter(c => c.CuentaTipo.includes('ACTIVO NETO'))

  const sorted = sortByDateAsc(activoNeto, 'FechaCorte')
  const entities = getUniqueValues(activoNeto, 'Entidad')
  const grouped = groupBy(activoNeto, 'Entidad')
  const uniqueDates = getUniqueValues(sorted, 'FechaCorte')

  const chartData = uniqueDates.map(fecha => {
    const point: Record<string, string | number> = { fecha: formatDateShort(fecha) }
    entities.forEach(ent => {
      const match = grouped[ent]?.find((c: Cuenta) => c.FechaCorte === fecha)
      if (match) point[ent] = match.MontoColones ?? 0
    })
    return point
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tooltipFormatter = (value: any, name: any) => [formatCurrencyBillions(Number(value)), name]

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Activo Neto del Fondo por OPC</h3>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
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
            <Line
              key={ent}
              type="monotone"
              dataKey={ent}
              stroke={OPC_COLORS[ent] || '#6b7280'}
              strokeWidth={2}
              dot={false}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}