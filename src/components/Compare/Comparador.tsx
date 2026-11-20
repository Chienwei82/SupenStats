import { useMemo, useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { fetchRendimiento } from '../../api/apiService'
import { useReportQuery, useUrlParam } from '../../hooks/useReportQuery'
import { FILTER_DEFAULTS } from '../../constants/filters'
import { OPC_LIST, entityColor } from '../../constants/supen'
import { getUniqueValues, sortByDateAsc, formatDateShort, formatPercent } from '../../utils/dataTransformers'
import { KpiCard } from '../ui/KpiCard'
import { ChartCard } from '../ui/ChartCard'
import { ChartNote } from '../ui/ChartNote'
import { ReportView } from '../ui/ReportView'
import { DataTable, type DataColumn } from '../ui/DataTable'
import { ExportButton } from '../ui/ExportButton'
import type { CsvColumn } from '../../utils/export'
import type { Rendimiento, FondoTipo, DateRange } from '../../types/supen'

interface ComparacionRow {
  fecha: string
  [key: string]: string | number
}

/**
 * Comparador de dos operadoras (Fase 1 cross-filter + Fase 2 comparador).
 * Selecciona dos OPC y una métrica (nominal/real); descarga una sola vez el
 * rendimiento del fondo y compara ambas series en el tiempo, con KPIs de último
 * valor, diferencia y tabla exportable. La métrica queda en la URL (compartible).
 */
export function Comparador() {
  const [opcA, setOpcA] = useState<string>(OPC_LIST[0]!)
  const [opcB, setOpcB] = useState<string>(OPC_LIST[1]!)
  const [metrica, setMetrica] = useUrlParam<'nominal' | 'real'>(
    'metrica',
    (v): v is 'nominal' | 'real' => v === 'real' || v === 'nominal',
    'nominal',
  )
  const fondo: FondoTipo = 'ROP'
  const dates = FILTER_DEFAULTS.standard.dates as DateRange

  const { data, loading, error, refetch } = useReportQuery<Rendimiento>(
    ['comparador', fondo, dates.FechaInicio, dates.FechaFinal],
    signal => fetchRendimiento(fondo, undefined, dates, signal),
  )

  const entidades = useMemo(
    () => (data.length > 0 ? getUniqueValues(data, 'Entidad') : OPC_LIST),
    [data],
  )

  // Cada OPC debe ser distinta para que la comparación tenga sentido.
  const opcAEfectiva = opcA
  const opcBEfectiva = opcB === opcA ? entidades.find(e => e !== opcA) ?? opcB : opcB

  const valorCampo = metrica === 'real' ? 'RendimientoReal' : 'RendimientoNominal'

  const serieA = useMemo(
    () => data.filter(r => r.Entidad === opcAEfectiva && r[valorCampo] != null),
    [data, opcAEfectiva, valorCampo],
  )
  const serieB = useMemo(
    () => data.filter(r => r.Entidad === opcBEfectiva && r[valorCampo] != null),
    [data, opcBEfectiva, valorCampo],
  )

  const chartData = useMemo<ComparacionRow[]>(() => {
    const idx = new Map<string, ComparacionRow>()
    for (const r of serieA) {
      const row = idx.get(r.FechaCorte) ?? { fecha: formatDateShort(r.FechaCorte) }
      row[opcAEfectiva] = r[valorCampo] as number
      idx.set(r.FechaCorte, row)
    }
    for (const r of serieB) {
      const row = idx.get(r.FechaCorte) ?? { fecha: formatDateShort(r.FechaCorte) }
      row[opcBEfectiva] = r[valorCampo] as number
      idx.set(r.FechaCorte, row)
    }
    return [...idx.values()]
  }, [serieA, serieB, opcAEfectiva, opcBEfectiva, valorCampo])

  const ultimoA = useMemo(() => {
    const s = sortByDateAsc(serieA, 'FechaCorte')
    return s.length ? (s[s.length - 1]![valorCampo] as number) : null
  }, [serieA, valorCampo])
  const ultimoB = useMemo(() => {
    const s = sortByDateAsc(serieB, 'FechaCorte')
    return s.length ? (s[s.length - 1]![valorCampo] as number) : null
  }, [serieB, valorCampo])
  const diferencia = ultimoA != null && ultimoB != null ? ultimoA - ultimoB : null

  const flatRows = useMemo(
    () =>
      chartData.map(row => ({
        fecha: String(row.fecha),
        [opcAEfectiva]: (row[opcAEfectiva] as number | undefined) ?? null,
        [opcBEfectiva]: (row[opcBEfectiva] as number | undefined) ?? null,
      })),
    [chartData, opcAEfectiva, opcBEfectiva],
  )

  const tableColumns: DataColumn<Record<string, string | number | null>>[] = [
    { key: 'fecha', header: 'Fecha', text: true },
    { key: opcAEfectiva, header: opcAEfectiva, align: 'right', render: r => formatPercent(r[opcAEfectiva] as number | null) },
    { key: opcBEfectiva, header: opcBEfectiva, align: 'right', render: r => formatPercent(r[opcBEfectiva] as number | null) },
  ]

  const csvColumns: CsvColumn<Record<string, string | number | null>>[] = [
    { key: 'fecha', header: 'Fecha' },
    { key: opcAEfectiva, header: opcAEfectiva },
    { key: opcBEfectiva, header: opcBEfectiva },
  ]

  const toggleMetrica = (
    <div
      className="inline-flex rounded-lg border border-gray-300 dark:border-[#34324a] overflow-hidden ml-auto"
      role="group"
      aria-label="Métrica de rentabilidad"
    >
      {(['nominal', 'real'] as const).map(m => (
        <button
          key={m}
          type="button"
          onClick={() => setMetrica(m)}
          aria-pressed={metrica === m}
          className={`px-3 py-1 text-xs font-medium capitalize transition-colors ${
            metrica === m
              ? 'bg-[#7c4dff] text-white'
              : 'bg-white dark:bg-[#25293c] text-gray-600 dark:text-[#a6accd] hover:bg-gray-100 dark:hover:bg-[#303348]'
          }`}
        >
          {m}
        </button>
      ))}
    </div>
  )

  const selector = (label: string, value: string, onChange: (v: string) => void, exclude: string) => (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-xs font-medium text-gray-600 dark:text-[#a6accd]">{label}</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="px-3 py-1.5 text-sm bg-white dark:bg-[#25293c] dark:text-[#eeffff] border border-gray-300 dark:border-[#34324a] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#82aaff]"
      >
        {entidades
          .filter(e => e !== exclude || e === value)
          .map(e => (
            <option key={e} value={e}>{e}</option>
          ))}
      </select>
    </label>
  )

  return (
    <section
      role="tabpanel"
      id="panel-comparador"
      aria-labelledby="tab-comparador"
      tabIndex={0}
      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg space-y-4"
    >
      <div className="flex flex-wrap items-center gap-3">
        {selector('Operadora A', opcAEfectiva, setOpcA, opcBEfectiva)}
        {selector('Operadora B', opcBEfectiva, setOpcB, opcAEfectiva)}
      </div>

      <ReportView loading={loading} error={error} dataCount={data.length} onRetry={refetch}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KpiCard label={`${opcAEfectiva} (${metrica})`} value={formatPercent(ultimoA)} />
          <KpiCard label={`${opcBEfectiva} (${metrica})`} value={formatPercent(ultimoB)} />
          <KpiCard label="Diferencia (A − B)" value={diferencia == null ? 'N/D' : formatPercent(diferencia)} />
        </div>

        <ChartCard
          title={`Comparador de rentabilidad ${metrica}`}
          description={`Comparación de la rentabilidad ${metrica} en el tiempo entre ${opcAEfectiva} y ${opcBEfectiva}.`}
          subtitle={toggleMetrica}
        >
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="fecha" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `${v}%`} width={48} />
              <Tooltip formatter={(value) => formatPercent(Number(value))} labelFormatter={l => `Fecha: ${l}`} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey={opcAEfectiva} stroke={entityColor(opcAEfectiva)} strokeWidth={2} dot={false} connectNulls name={opcAEfectiva} />
              <Line type="monotone" dataKey={opcBEfectiva} stroke={entityColor(opcBEfectiva)} strokeWidth={2} dot={false} connectNulls name={opcBEfectiva} />
            </LineChart>
          </ResponsiveContainer>
          <ChartNote noteId="rendimiento" />
        </ChartCard>

        <div className="bg-white dark:bg-[#25293c] rounded-xl border border-gray-200 dark:border-[#34324a] p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-[#eeffff]">Datos comparados</h3>
            <ExportButton rows={flatRows} columns={csvColumns} filename={`comparador-${opcAEfectiva}-vs-${opcBEfectiva}`} />
          </div>
          <DataTable
            rows={flatRows}
            columns={tableColumns}
            defaultSortKey="fecha"
            caption={`Comparación de rentabilidad ${metrica}`}
          />
        </div>
      </ReportView>
    </section>
  )
}