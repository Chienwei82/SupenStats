import type { ReactNode } from 'react'
import type { SortDir } from '../../hooks/useSortableTable'

interface SortHeaderProps<K extends string> {
  sortKey: K
  current: K
  dir: SortDir
  onSort: (k: K) => void
  align?: 'left' | 'right'
  children: ReactNode
}

/**
 * Celda de encabezado ordenable accesible. Usa un <button> dentro del <th> para
 * que el comportamiento de teclado (Enter/Space), foco y roles de screen reader
 * sean nativos sin reinventarlos a mano. Compartida por las tablas que ordenan
 * datos numéricos y de texto.
 */
export function SortHeader<K extends string>({
  sortKey,
  current,
  dir,
  onSort,
  align = 'left',
  children,
}: SortHeaderProps<K>) {
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