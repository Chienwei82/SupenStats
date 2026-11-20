import { useMemo, type ReactNode } from 'react'
import { useSortableTable } from '../../hooks/useSortableTable'
import { SortHeader } from './SortHeader'

/** Definición de una columna de la tabla genérica. */
export interface DataColumn<T> {
  /** Clave del campo del registro. */
  key: keyof T & string
  /** Encabezado visible. */
  header: string
  /** Alineación (los números suelen ir a la derecha). */
  align?: 'left' | 'right'
  /** Si true, la columna se ordena como texto (localeCompare); si false, numérico. */
  text?: boolean
  /** Render personalizado de la celda (formato de moneda, badges, etc.). */
  render?: (row: T) => ReactNode
}

interface DataTableProps<T> {
  rows: T[]
  columns: DataColumn<T>[]
  /** Clave de orden inicial. Por defecto, la primera columna. */
  defaultSortKey?: keyof T & string
  /** Genera la key estable de cada fila. Por defecto, el índice. */
  rowKey?: (row: T, index: number) => string
  /** Mensaje cuando no hay filas. */
  emptyMessage?: string
  /** Texto accesible que describe la tabla (aria-label/caption). */
  caption?: string
}

/**
 * Tabla ordenable genérica y accesible (Fase 1 — tabla alternativa).
 *
 * Reutiliza `useSortableTable` + `SortHeader` (mismo patrón que las tablas de
 * los reportes) y ordena por la columna activa. Los valores `null`/`undefined`
 * se muestran como "N/D" y siempre quedan al final, sin importar la dirección
 * (consistente con la preservación de nulos del resto de la app). Los encabezados
 * usan `aria-sort` y botones nativos para teclado/lector de pantalla.
 */
export function DataTable<T>({
  rows,
  columns,
  defaultSortKey,
  rowKey,
  emptyMessage = 'Sin datos para mostrar',
  caption,
}: DataTableProps<T>) {
  const firstKey = defaultSortKey ?? columns[0]!.key
  const { sortKey, sortDir, onSort } = useSortableTable({
    defaultKey: firstKey,
    isTextKey: k => columns.find(c => c.key === k)?.text ?? false,
  })

  const sorted = useMemo(() => {
    const col = columns.find(c => c.key === sortKey)
    const factor = sortDir === 'asc' ? 1 : -1
    return [...rows].sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      const aNull = av == null
      const bNull = bv == null
      // Nulos siempre al final (no se invierten con la dirección).
      if (aNull && bNull) return 0
      if (aNull) return 1
      if (bNull) return -1
      const cmp = col?.text
        ? String(av).localeCompare(String(bv), 'es')
        : Number(av) - Number(bv)
      return cmp * factor
    })
  }, [rows, columns, sortKey, sortDir])

  if (rows.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-[#a6accd] py-6 text-center">
        {emptyMessage}
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-[#34324a]">
      <table className="min-w-full text-sm">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead className="bg-gray-50 dark:bg-[#262a3a]">
          <tr>
            {columns.map(col => (
              <SortHeader
                key={col.key}
                sortKey={sortKey}
                current={sortKey}
                dir={sortDir}
                onSort={onSort}
                align={col.align}
              >
                {col.header}
              </SortHeader>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-[#2b2a3e]">
          {sorted.map((row, i) => (
            <tr
              key={rowKey ? rowKey(row, i) : i}
              className="hover:bg-gray-50 dark:hover:bg-[#2b2f42] transition-colors"
            >
              {columns.map(col => {
                const raw = row[col.key]
                return (
                  <td
                    key={col.key}
                    className={`px-2 py-2 ${
                      col.align === 'right' ? 'text-right tabular-nums' : ''
                    } ${raw == null ? 'text-gray-400 dark:text-[#676e95]' : 'text-gray-700 dark:text-[#a6accd]'}`}
                  >
                    {raw == null ? 'N/D' : col.render ? col.render(row) : String(raw)}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}