import { useMemo } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { sortByDateAsc, groupBy, getUniqueValues, formatDateShort, formatNumber } from '../../utils/dataTransformers'
import { entityColor } from '../../constants/supen'
import { ChartCard } from '../ui/ChartCard'
import { ChartNote } from '../ui/ChartNote'
import type { Afiliado } from '../../types/supen'

interface Props {
  data: Afiliado[]
}

export function AfiliadosChart({ data }: Props) {
  const { chartData, entities } = useMemo(() => {
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

    return { chartData, entities }
  }, [data])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tooltipFormatter = (value: any, name: any) => [formatNumber(Number(value)), name]

  return (
    <ChartCard
      title="Evolucion de Afiliados por OPC"
      description="Gráfico de área: evolución temporal del número de afiliados de cada operadora de pensiones."
    >
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
              stroke={entityColor(ent)}
              fill={entityColor(ent)}
              fillOpacity={0.1}
              strokeWidth={2}
              dot={false}
              connectNulls
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
      <ChartNote noteId="afiliados" />
    </ChartCard>
  )
}
