import { useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { formatDateShort, formatCurrencyBillions, groupBy, getUniqueValues, sortByDateAsc } from '../../utils/dataTransformers'
import { entityColor } from '../../constants/supen'
import { ChartCard } from '../ui/ChartCard'
import { ChartNote } from '../ui/ChartNote'
import type { Cuenta } from '../../types/supen'

interface Props {
  data: Cuenta[]
}

export function CuentasChart({ data }: Props) {
  const { chartData, entities } = useMemo(() => {
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
        // Hueco (sin punto) cuando el monto no está disponible: un `?? 0`
        // dibujaba un 0 falso para el mes sin registro.
        if (match && match.MontoColones != null) point[ent] = match.MontoColones
      })
      return point
    })

    return { chartData, entities }
  }, [data])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tooltipFormatter = (value: any, name: any) => [formatCurrencyBillions(Number(value)), name]

  return (
    <ChartCard
      title="Activo Neto del Fondo por OPC"
      description="Gráfico de líneas: activo neto del fondo de pensiones de cada operadora a lo largo del tiempo."
    >
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
              stroke={entityColor(ent)}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <ChartNote noteId="cuentas" />
    </ChartCard>
  )
}