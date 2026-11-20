import { useMemo, useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Brush,
} from 'recharts'
import { sortByDateAsc, getUniqueValues, formatDateShort, formatDate } from '../../utils/dataTransformers'
import { entityColor } from '../../constants/supen'
import { ChartCard, truncateLegend } from '../ui/ChartCard'
import { ChartNote } from '../ui/ChartNote'
import { DataTable, type DataColumn } from '../ui/DataTable'
import { ExportButton } from '../ui/ExportButton'
import type { CsvColumn } from '../../utils/export'

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
  /** Habilita el zoom/brush temporal (activo si hay suficientes cortes). */
  enableBrush?: boolean
  /** Habilita la vista de tabla alternativa + exportación CSV. */
  enableTable?: boolean
}

/** Fila plana para la tabla alternativa y el CSV. */
interface FlatRow {
  fecha: string
  entidad: string
  valor: number | null
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
  enableBrush = true,
  enableTable = true,
}: TimeSeriesChartProps<T>) {
  const [view, setView] = useState<'chart' | 'table'>('chart')

  const valid = useMemo(
    () => data.filter(d => d[valueField] != null),
    [data, valueField]
  )

  const entities = useMemo(() => getUniqueValues(valid, seriesField), [valid, seriesField])

  const chartData = useMemo(() => {
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

  // Filas planas (una por punto válido) para la tabla alternativa y el CSV.
  const flatRows = useMemo<FlatRow[]>(() =>
    sortByDateAsc(valid, dateField).map(r => ({
      fecha: formatDate(String(r[dateField])),
      entidad: String(r[seriesField]),
      valor: (r[valueField] as number | null) ?? null,
    })),
  [valid, dateField, valueField, seriesField])

  const tableColumns: DataColumn<FlatRow>[] = [
    { key: 'fecha', header: 'Fecha', text: true },
    { key: 'entidad', header: 'Operadora', text: true },
    { key: 'valor', header: 'Valor', align: 'right', render: r => formatValue(r.valor as number) },
  ]

  const csvColumns: CsvColumn<FlatRow>[] = [
    { key: 'fecha', header: 'Fecha' },
    { key: 'entidad', header: 'Operadora' },
    { key: 'valor', header: 'Valor' },
  ]

  const showBrush = enableBrush && chartData.length > 12

  const toggle = enableTable && (
    <div
      className="inline-flex rounded-lg border border-gray-300 dark:border-[#34324a] overflow-hidden ml-auto"
      role="group"
      aria-label="Cambiar vista del gráfico"
    >
      <button
        type="button"
        onClick={() => setView('chart')}
        aria-pressed={view === 'chart'}
        className={`px-3 py-1 text-xs font-medium transition-colors ${
          view === 'chart'
            ? 'bg-[#7c4dff] text-white'
            : 'bg-white dark:bg-[#25293c] text-gray-600 dark:text-[#a6accd] hover:bg-gray-100 dark:hover:bg-[#303348]'
        }`}
      >
        Gráfico
      </button>
      <button
        type="button"
        onClick={() => setView('table')}
        aria-pressed={view === 'table'}
        className={`px-3 py-1 text-xs font-medium transition-colors ${
          view === 'table'
            ? 'bg-[#7c4dff] text-white'
            : 'bg-white dark:bg-[#25293c] text-gray-600 dark:text-[#a6accd] hover:bg-gray-100 dark:hover:bg-[#303348]'
        }`}
      >
        Tabla
      </button>
    </div>
  )

  return (
    <ChartCard
      title={title}
      description={description}
      subtitle={
        (subtitle || toggle) ? (
          <div className="flex items-center gap-3 mb-3 -mt-2 flex-wrap">{subtitle}{toggle}</div>
        ) : undefined
      }
    >
      {view === 'chart' ? (
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
            {showBrush && (
              <Brush dataKey="fecha" height={24} stroke="#8b9bd4" fill="rgba(124,77,255,0.08)" />
            )}
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="space-y-3">
          <div className="flex justify-end">
            <ExportButton rows={flatRows} columns={csvColumns} filename={title} />
          </div>
          <DataTable
            rows={flatRows}
            columns={tableColumns}
            defaultSortKey="fecha"
            caption={`${title} en formato de tabla`}
          />
        </div>
      )}
      <ChartNote noteId={noteId} />
    </ChartCard>
  )
}
