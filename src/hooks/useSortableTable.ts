import { useState } from 'react'

export type SortDir = 'asc' | 'desc'

interface UseSortableTableOptions<K extends string> {
  /** Clave por la que se ordena inicialmente. */
  defaultKey: K
  /** Dirección inicial. */
  defaultDir?: SortDir
  /** Predicado: true si la columna es textual (abre ascendente al cambiar). */
  isTextKey?: (k: K) => boolean
}

/**
 * Estado compartido del ordenamiento de una tabla (columna + dirección) y el
 * toggle de click: al hacer click en la columna activa invierte la dirección,
 * al cambiar de columna elige asc/desc según el tipo (texto → asc, número →
 * desc). Extraído de los charts que muestran tablas ordenables para no repetir
 * `useState` + `onSort` en cada uno.
 */
export function useSortableTable<K extends string>({
  defaultKey,
  defaultDir = 'asc',
  isTextKey,
}: UseSortableTableOptions<K>) {
  const [sortKey, setSortKey] = useState<K>(defaultKey)
  const [sortDir, setSortDir] = useState<SortDir>(defaultDir)

  const onSort = (k: K) => {
    if (sortKey === k) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(k)
      setSortDir(isTextKey?.(k) ? 'asc' : 'desc')
    }
  }

  return { sortKey, sortDir, onSort } as const
}