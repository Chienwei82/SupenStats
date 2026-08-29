import { useMemo, useState, type ReactNode } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { agregarVariacionPorOpc, calcularVariacionNeta, type VariacionPorOpc } from '../../utils/traslados'
import { formatDateShort, formatNumber, formatPercent } from '../../utils/dataTransformers'
import { entityColor } from '../../constants/supen'
import { useUrlParam } from '../../hooks/useReportQuery'
import { ChartCard } from '../ui/ChartCard'
import { ChartNote } from '../ui/ChartNote'
import type { AfiliadoMensual } from '../../types/supen'

interface Props {
  data: AfiliadoMensual[]
}

type SortKey = 'entidad' | 'total' | 'pctTotal' | 'best' | 'worst'
type SortDir = 'asc' | 'desc'

/**
 * Vista A del reporte: variación neta de afiliados por OPC a lo largo del
 * tiempo. Es un ESTIMADO DERIVADO: incluye traslados entre OPCs, nuevas
 * afiliaciones y bajas (pensionados, fallecidos, retiros). NO es conteo de
 * traslados individuales; para eso está la vista B (que consume /lt).
 *
 * Reglas de faltantes (R3.3, R8.2): si falta el dato en t o en t-1, el delta
 * se representa como null y la línea muestra un hueco (connectNulls=false).
 */
export function VariacionNetaChart({ data }: Props) {
  // La métrica vive en la URL (`?variacion=abs|pct`) para que la vista quede
  // reflejada en la URL y sea compartible, igual que los demás selectores.
  const [metrica, setMetrica] = useUrlParam(
    'variacion',
    v => v === 'abs' || v === 'pct',
    'abs',
  ) as ['abs' | 'pct', (v: string) => void]

  const puntos = useMemo(() => calcularVariacionNeta(data, metrica), [data, metrica])
  const entidades = useMemo(() => {
    const set = new Set<string>()
    for (const s of data) set.add(s.Entidad)
    return [...set].sort()
  }, [data])

  const tabla = useMemo<VariacionPorOpc[]>(
    () => agregarVariacionPorOpc(data, puntos),
    [data, puntos],
  )

  const [sortKey, setSortKey] = useState<SortKey>('entidad')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const tablaOrdenada = useMemo(() => {
    const cmp = (a: VariacionPorOpc, b: VariacionPorOpc): number => {
      const dir = sortDir === 'asc' ? 1 : -1
      switch (sortKey) {
        case 'entidad': return dir * a.entidad.localeCompare(b.entidad)
        case 'total': return dir * cmpNum(a.variacionTotal, b.variacionTotal)
        case 'pctTotal': return dir * cmpNum(a.variacionPctTotal, b.variacionPctTotal)
        case 'best': return dir * cmpNum(a.best, b.best)
        case 'worst': return dir * cmpNum(a.worst, b.worst)
      }
    }
    return [...tabla].sort(cmp)
  }, [tabla, sortKey, sortDir])

  const onSort = (k: SortKey) => {
    if (sortKey === k) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(k); setSortDir(k === 'entidad' ? 'asc' : 'desc') }
  }

  return (
    <ChartCard
      title="Variación neta de afiliados por OPC"
      description="Estimado derivado: diferencia mensual de afiliados. Incluye traslados, nuevas afiliaciones y bajas."
    >
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {(['abs', 'pct'] as const).map(m => (
          <button
            key={m}
            type="button"
            aria-pressed={metrica === m}
            onClick={() => setMetrica(m)}
            className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
              metrica === m
                ? 'bg-[#7c4dff] text-white border-[#7c4dff]'
                : 'bg-transparent text-gray-600 dark:text-[#a6accd] border-gray-300 dark:border-[#414868] hover:bg-gray-100 dark:hover:bg-[#303348]'
            }`}
          >
            {m === 'abs' ? 'Variación absoluta' : 'Variación porcentual'}
          </button>
        ))}
      </div>

      {puntos.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-[#a6accd] py-8 text-center">
          No hay datos de afiliados en el rango seleccionado.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={puntos} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.25)" />
            <XAxis dataKey="fecha" tick={{ fontSize: 11 }} tickFormatter={(v: string) => formatDateShort(v)} interval="preserveStartEnd" />
            <YAxis
              tick={{ fontSize: 11 }}
              tickFormatter={metrica === 'pct' ? (v: number) => `${v.toFixed(1)}%` : (v: number) => formatNumber(v)}
            />
            <Tooltip
              labelFormatter={(label) => `Fecha: ${label}`}
              formatter={(value, name) => {
                if (value == null) return ['No disponible', name as string]
                return metrica === 'pct'
                  ? [`${(Number(value)).toFixed(2)}%`, name as string]
                  : [formatNumber(Number(value)), name as string]
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {entidades.map(ent => (
              <Line
                key={ent}
                type="monotone"
                dataKey={ent}
                name={ent}
                stroke={entityColor(ent)}
                strokeWidth={2}
                dot={false}
                connectNulls={false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}

      {tabla.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 dark:text-[#a6accd] uppercase">
                <SortHeader sortKey="entidad" current={sortKey} dir={sortDir} onSort={onSort}>OPC</SortHeader>
                <SortHeader sortKey="total" current={sortKey} dir={sortDir} onSort={onSort} align="right">Var. total</SortHeader>
                <SortHeader sortKey="pctTotal" current={sortKey} dir={sortDir} onSort={onSort} align="right">Var. % total</SortHeader>
                <SortHeader sortKey="best" current={sortKey} dir={sortDir} onSort={onSort} align="right">Mejor mes</SortHeader>
                <SortHeader sortKey="worst" current={sortKey} dir={sortDir} onSort={onSort} align="right">Peor mes</SortHeader>
              </tr>
            </thead>
            <tbody>
              {tablaOrdenada.map(f => (
                <tr key={f.entidad} className="border-t border-gray-200 dark:border-[#34324a]">
                  <td className="px-2 py-2 text-gray-800 dark:text-[#eeffff]">{f.entidad}</td>
                  <td className="px-2 py-2 text-right">{fmtDelta(f.variacionTotal, 'abs')}</td>
                  <td className="px-2 py-2 text-right">{fmtDelta(f.variacionPctTotal, 'pct')}</td>
                  <td className="px-2 py-2 text-right">{fmtDelta(f.best, metrica)}</td>
                  <td className="px-2 py-2 text-right">{fmtDelta(f.worst, metrica)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ChartNote noteId="traslados-variacion" />
    </ChartCard>
  )
}

function cmpNum(a: number | null, b: number | null): number {
  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1
  return a - b
}

function fmtDelta(v: number | null, kind: 'abs' | 'pct'): string {
  if (v == null) return '—'
  if (kind === 'pct') return formatPercent(v)
  return formatNumber(v)
}

interface SortHeaderProps {
  sortKey: SortKey
  current: SortKey
  dir: SortDir
  onSort: (k: SortKey) => void
  align?: 'left' | 'right'
  children: ReactNode
}

/**
 * Celda de encabezado ordenable accesible. Usa un <button> dentro del <th> para
 * que el comportamiento de teclado (Enter/Space), foco y roles de screen reader
 * sean nativos sin reinventarlos a mano.
 */
function SortHeader({ sortKey, current, dir, onSort, align = 'left', children }: SortHeaderProps) {
  const isActive = current === sortKey
  const ariaSort = isActive ? (dir === 'asc' ? 'ascending' : 'descending') : 'none'
  return (
    <th
      scope="col"
      aria-sort={ariaSort}
      className={`px-2 py-2 ${align === 'right' ? 'text-right' : ''}`}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={`inline-flex items-center gap-1 select-none hover:text-gray-800 dark:hover:text-[#eeffff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#89ddff] focus-visible:rounded ${
          align === 'right' ? 'flex-row-reverse' : ''
        }`}
      >
        {children}
        {isActive && <span aria-hidden="true">{dir === 'asc' ? '▲' : '▼'}</span>}
      </button>
    </th>
  )
}
