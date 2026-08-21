import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { sortByDateAsc, groupBy, getUniqueValues, formatDateShort } from '../../utils/dataTransformers'
import { OPC_COLORS } from '../../constants/suppen'
import { ChartNote } from '../ui/ChartNote'
import type { Comision } from '../../types/suppen'

interface Props {
  data: Comision[]
}

export function ComisionesChart({ data }: Props) {
  const valid = data.filter(c => c.ComisionTotal != null)
  const grouped = groupBy(valid, 'Entidad')
  const entities = getUniqueValues(valid, 'Entidad')

  const sorted = sortByDateAsc(valid, 'FechaCorte')
  const uniqueDates = getUniqueValues(sorted, 'FechaCorte')

  const chartData = uniqueDates.map(fecha => {
    const point: Record<string, string | number> = { fecha: formatDateShort(fecha) }
    entities.forEach(ent => {
      const match = grouped[ent]?.find((c: Comision) => c.FechaCorte === fecha)
      if (match?.ComisionTotal != null) {
        point[ent] = match.ComisionTotal
      }
    })
    return point
  })

  const latestDate = sorted.length > 0 ? sorted[sorted.length - 1].FechaCorte : null
  const latestValues = entities.map(ent => {
    const match = grouped[ent]?.find((c: Comision) => c.FechaCorte === latestDate)
    return match?.ComisionTotal
  }).filter((v): v is number => v != null)
  const allEqual = latestValues.length > 0 && latestValues.every(v => v === latestValues[0])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tooltipFormatter = (value: any, name: any) => [`${Number(value).toFixed(2)}%`, name]

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-1">Evolucion de Comisiones de Administracion por OPC</h3>
      {allEqual && (
        <p className="text-sm text-gray-500 mb-4">
          Todas las operadoras cobran la misma comision de <span className="font-medium text-gray-700">{latestValues[0]?.toFixed(2)}%</span> en el periodo seleccionado. La comision quedo unificada tras la regulacion vigente desde 2020.
        </p>
      )}
      {!allEqual && (
        <p className="text-sm text-gray-500 mb-4">
          Evolucion de la comision de administracion (SALDO) por operadora.
        </p>
      )}
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="fecha" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 11 }} domain={['auto', 'auto']} tickFormatter={(v: number) => `${v}%`} />
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
      <ChartNote noteId="comisiones" />
    </div>
  )
}