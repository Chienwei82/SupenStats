import { useMemo, useState, type ReactNode } from 'react'
import { agregarFlujosPorOrigenDestino } from '../../utils/traslados'
import { formatNumber, formatCurrencyMillions } from '../../utils/dataTransformers'
import { ChartCard } from '../ui/ChartCard'
import { ChartNote } from '../ui/ChartNote'
import type { RawLibreTransferencia } from '../../types/supen'

interface Props {
  data: RawLibreTransferencia[]
}

type SortKey = 'origen' | 'destino' | 'cantidad' | 'monto'
type SortDir = 'asc' | 'desc'

const TOP_OPTIONS = [10, 15, 25, 50]

/**
 * Vista B2: top N flujos origen → destino en el rango, agregados en cantidad
 * y monto. La diagonal y los flujos con 0 traslados se excluyen.
 */
export function TopFlujosTable({ data }: Props) {
  const flujos = useMemo(() => agregarFlujosPorOrigenDestino(data), [data])
  const [top, setTop] = useState<number>(15)
  const [sortKey, setSortKey] = useState<SortKey>('cantidad')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const visibles = useMemo(() => {
    const sorted = [...flujos].sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1
      switch (sortKey) {
        case 'origen': return dir * a.Origen.localeCompare(b.Origen)
        case 'destino': return dir * a.Destino.localeCompare(b.Destino)
        case 'cantidad': return dir * (a.Cantidad - b.Cantidad)
        case 'monto': return dir * (a.Monto - b.Monto)
      }
    })
    return sorted.slice(0, top)
  }, [flujos, top, sortKey, sortDir])

  const onSort = (k: SortKey) => {
    if (sortKey === k) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(k); setSortDir(k === 'origen' || k === 'destino' ? 'asc' : 'desc') }
  }

  return (
    <ChartCard
      title="Top flujos origen → destino (vista B2)"
      description="Pares de operadoras ordenados por cantidad o monto de traslados en el rango seleccionado."
    >
      <div className="flex items-center gap-2 mb-3">
        <label className="text-xs text-gray-600 dark:text-[#a6accd]">
          Mostrar top:
          <select
            value={top}
            onChange={e => setTop(Number(e.target.value))}
            className="ml-2 px-2 py-1 text-sm bg-white dark:bg-[#25293c] dark:text-[#eeffff] border border-gray-300 dark:border-[#34324a] rounded-lg"
          >
            {TOP_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
      </div>

      {visibles.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-[#a6accd] py-8 text-center">
          No hay flujos de libre transferencia en el rango seleccionado.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 dark:text-[#a6accd] uppercase">
                <SortHeader sortKey="origen" current={sortKey} dir={sortDir} onSort={onSort}>Origen</SortHeader>
                <SortHeader sortKey="destino" current={sortKey} dir={sortDir} onSort={onSort}>Destino</SortHeader>
                <SortHeader sortKey="cantidad" current={sortKey} dir={sortDir} onSort={onSort} align="right">Cantidad</SortHeader>
                <SortHeader sortKey="monto" current={sortKey} dir={sortDir} onSort={onSort} align="right">Monto</SortHeader>
              </tr>
            </thead>
            <tbody>
              {visibles.map(f => (
                <tr key={`${f.Origen}|${f.Destino}`} className="border-t border-gray-200 dark:border-[#34324a]">
                  <td className="px-2 py-2 text-gray-800 dark:text-[#eeffff]">{f.Origen}</td>
                  <td className="px-2 py-2 text-gray-800 dark:text-[#eeffff]">{f.Destino}</td>
                  <td className="px-2 py-2 text-right">{formatNumber(f.Cantidad)}</td>
                  <td className="px-2 py-2 text-right">{formatCurrencyMillions(f.Monto)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ChartNote noteId="traslados-b2" />
    </ChartCard>
  )
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
 * Celda de encabezado ordenable accesible. <button> dentro de <th> para
 * soporte nativo de teclado (Enter/Space) y screen reader.
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
