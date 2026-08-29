import { useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { sortByDateAsc, getUniqueValues, formatDateShort } from '../../utils/dataTransformers'
import { entityColor } from '../../constants/supen'
import { ChartCard, truncateLegend } from '../ui/ChartCard'
import { ChartNote } from '../ui/ChartNote'

interface TimeSeriesChartProps<T> {
  data: T[]
  /** Campo de dominio (fecha) por el que se agrupa la serie. */
  dateField: keyof T & string
  /** Campo numérico a graficar. */
  valueField: keyof T & string
  /** Campo de serie (entidad). */
  seriesField: keyof T & string
  title: string
  subtitle?: React.ReactNode
  /** Descripción accesible para lectores de pantalla. */
  description?: string
  /** Clave de la nota educativa en CHART_NOTES. */
  noteId: string
  /** Formateador del valor en tooltip y eje Y. */
  formatValue?: (v: number) => string
}

/**
 * Gráfico de líneas de serie temporal genérico: pivota los datos a filas
 * { fecha, [entidad]: valor } usando lookup O(1) por Map (en vez de .find()
 * anidado) y renderiza una línea por entidad con el color canónico de OPC.
 */
export function TimeSeriesChart<T>({
  data,
  dateField,
  valueField,
  seriesField,
  title,
  subtitle,
  description,
  noteId,
  formatValue = v => `${Number(v).toFixed(2)}%`,
}: TimeSeriesChartProps<T>) {
  const valid = useMemo(
    () => data.filter(d => d[valueField] != null),
    [data, valueField]
  )

  const chartData = useMemo(() => {
    const entities = getUniqueValues(valid, seriesField)
    const sorted = sortByDateAsc(valid, dateField)
    const uniqueDates = getUniqueValues(sorted, dateField)

    // Índice (entidad|fecha) → registro para lookup O(1).
    const index = new Map<string, T>()
    for (const row of valid) {
      index.set(`${row[seriesField]}|${row[dateField]}`, row)
    }

    return uniqueDates.map(fecha => {
      const point: Record<string, string | number> = { fecha: formatDateShort(fecha) }
      for (const ent of entities) {
        const match = index.get(`${ent}|${fecha}`)
        if (match != null) {
          point[ent] = match[valueField] as number
        }
      }
      return point
    })
    // sorted/entities se recalculan dentro; solo dependen de valid/fields.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valid, dateField, valueField, seriesField])

  const entities = getUniqueValues(valid, seriesField)

  return (
    <ChartCard title={title} subtitle={subtitle} description={description}>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="fecha" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
          <YAxis
            tick={{ fontSize: 11 }}
            domain={['auto', 'auto']}
            tickFormatter={(v: number) => `${v}%`}
          />
          <Tooltip
            formatter={(value, name) => [formatValue(Number(value)), name] as [string, string]}
            labelFormatter={(label) => `Fecha: ${label}`}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} formatter={truncateLegend} />
          {entities.map(ent => (
            <Line
              key={ent}
              type="monotone"
              dataKey={ent}
              stroke={entityColor(ent)}
              strokeWidth={2}
              dot={false}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <ChartNote noteId={noteId} />
    </ChartCard>
  )
}
