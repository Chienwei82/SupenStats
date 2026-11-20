import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell,
} from 'recharts'
import { formatDateShort, formatNumber, sortByDateAsc } from '../../utils/dataTransformers'
import { CHART_COLORS } from '../../constants/supen'
import { ChartCard } from '../ui/ChartCard'
import { ChartNote } from '../ui/ChartNote'
import type { Beneficio } from '../../types/supen'

interface Props {
  data: Beneficio[]
}

export function BeneficiosChart({ data }: Props) {
  const { chartData, latestDate } = useMemo(() => {
    const sorted = sortByDateAsc(data, 'FechaCorte')
    const latestDate = sorted.length > 0 ? sorted[sorted.length - 1].FechaCorte : null
    const latest = latestDate ? data.filter(d => d.FechaCorte === latestDate) : data

    const byEntity = latest.reduce<Record<string, number>>((acc, b) => {
      acc[b.Entidad] = (acc[b.Entidad] || 0) + (b.CantidadPensionados ?? 0)
      return acc
    }, {})

    const chartData = Object.entries(byEntity)
      .map(([name, value]) => ({ name, pensionados: value }))
      .sort((a, b) => b.pensionados - a.pensionados)

    return { chartData, latestDate }
  }, [data])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tooltipFormatter = (value: any, name: any) => [formatNumber(Number(value)), name]

  return (
    <ChartCard
      title={`Pensionados por OPC ${latestDate ? `(${formatDateShort(latestDate)})` : ''}`}
      description="Gráfico de barras horizontales: personas pensionadas por operadora en el corte más reciente."
    >
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 90 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v: number) => formatNumber(v)} />
          <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11 }} />
          <Tooltip
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={tooltipFormatter as any}
            labelFormatter={(label) => String(label)}
          />
          <Legend />
          <Bar dataKey="pensionados" name="Pensionados" radius={[0, 4, 4, 0]}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <ChartNote noteId="beneficios" />
    </ChartCard>
  )
}