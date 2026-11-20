/**
 * Utilidades de exportación a CSV (Fase 2 — Exportación).
 *
 * Funciones puras (`toCsv`) separadas del efecto de descarga (`downloadCsv`)
 * para poder testear la serialización sin DOM. El separador es coma y los
 * valores que contienen coma, comilla, salto de línea o punto y coma se escapan
 * con comillas dobles (RFC 4180). Se antepone BOM (U+FEFF) al descargar para
 * que Excel interprete correctamente los acentos en UTF-8.
 */

export interface CsvColumn<T> {
  /** Clave del campo del registro. */
  key: keyof T & string
  /** Etiqueta de la columna en la cabecera. */
  header: string
  /**
   * Formateador opcional del valor a serializar. Si no se provee, se usa el
   * valor crudo. `null`/`undefined` se serializan como cadena vacía.
   */
  format?: (value: unknown, row: T) => string | number
}

/** Escapa una celda CSV según RFC 4180. */
function escapeCell(value: string | number): string {
  const s = String(value)
  // Comillas → dobles; delimitamos si hay coma, comilla, salto o punto y coma.
  if (/[",\n\r;]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

/**
 * Serializa filas a texto CSV con cabecera. `columns` define el orden y las
 * etiquetas de las columnas; una columna puede transformar su valor con
 * `format`. Los valores ausentes se exportan como celda vacía (no "null").
 */
export function toCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const header = columns.map(c => escapeCell(c.header)).join(',')
  const lines = rows.map(row =>
    columns
      .map(c => {
        const raw = row[c.key]
        const value = c.format ? c.format(raw, row) : raw
        return escapeCell(value == null ? '' : (value as string | number))
      })
      .join(','),
  )
  return [header, ...lines].join('\n')
}

/** Nombre de archivo seguro a partir de un texto arbitrario. */
export function safeFilename(name: string): string {
  const cleaned = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
  return cleaned || 'datos'
}

/**
 * Descarga el CSV como archivo (efecto de navegador). Antepone BOM para Excel.
 * Solo disponible en cliente; no-op seguro si `document` no existe.
 */
export function downloadCsv(filename: string, csv: string): void {
  if (typeof document === 'undefined') return
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}