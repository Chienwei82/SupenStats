import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { CHART_COLORS } from '../../constants/suppen'
import { sortByDateAsc } from '../../utils/dataTransformers'
import type { Portafolio } from '../../types/suppen'

interface Props {
  data: Portafolio[]
  title?: string
}

export function PortafolioChart({ data, title = 'Distribucion del Portafolio de Inversion' }: Props) {
  // Usamos solo la fecha de corte más reciente para la distribución actual.
  const sorted = sortByDateAsc(data, 'FechaCorte')
  const latestDate = sorted.length > 0 ? sorted[sorted.length - 1].FechaCorte : null
  const latestData = latestDate ? data.filter(d => d.FechaCorte === latestDate) : data

  const aggregated = latestData.reduce<Record<string, number>>((acc, item) => {
    const key = item.TipoInstrumento || 'Sin clasificar'
    acc[key] = (acc[key] || 0) + (item.Monto ?? 0)
    return acc
  }, {})

  const chartData = Object.entries(aggregated)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  const total = chartData.reduce((sum, d) => sum + d.value, 0)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tooltipFormatter = (value: any, name: any) => {
    const pct = total > 0 ? ((Number(value) / total) * 100).toFixed(1) : '0'
    return [`${pct}%`, name]
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={130}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((_, i) => (
              <Cell
                key={i}
                fill={CHART_COLORS[i % CHART_COLORS.length]}
                stroke="white"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={tooltipFormatter as any}
          />
          <Legend
            layout="vertical"
            align="right"
            verticalAlign="middle"
            formatter={(value) => {
              const s = String(value)
              return s.length > 22 ? `${s.substring(0, 20)}...` : s
            }}
            wrapperStyle={{ fontSize: 11 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
