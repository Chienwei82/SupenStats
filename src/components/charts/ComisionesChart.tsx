import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell,
} from 'recharts'
import { CHART_COLORS } from '../../constants/suppen'
import type { Comision } from '../../types/suppen'

interface Props {
  data: Comision[]
}

export function ComisionesChart({ data }: Props) {
  const sorted = [...data]
    .filter(c => c.ComisionTotal != null)
    .sort((a, b) => a.ComisionTotal - b.ComisionTotal)

  const chartData = sorted.map(c => ({
    name: c.Entidad?.length > 18 ? `${c.Entidad.substring(0, 16)}...` : c.Entidad,
    fullName: c.Entidad,
    comision: c.ComisionTotal,
  }))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tooltipFormatter = (value: any) => [`${Number(value).toFixed(2)}%`, 'Comision Total']

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Comisiones de Administracion</h3>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 80 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 11 }}
            tickFormatter={(v: number) => `${v}%`}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={120}
            tick={{ fontSize: 11 }}
          />
          <Tooltip
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={tooltipFormatter as any}
            labelFormatter={(label) => {
              const item = chartData.find(d => d.name === String(label))
              return item?.fullName || String(label)
            }}
          />
          <Legend />
          <Bar dataKey="comision" name="Comision Total (%)" radius={[0, 4, 4, 0]}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
