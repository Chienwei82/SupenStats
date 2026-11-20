import { toCsv, downloadCsv, safeFilename, type CsvColumn } from '../../utils/export'

interface ExportButtonProps<T> {
  /** Filas a exportar. */
  rows: T[]
  /** Columnas (orden y etiquetas) del CSV. */
  columns: CsvColumn<T>[]
  /** Nombre base del archivo (sin extensión). */
  filename: string
  /** Texto del botón. */
  label?: string
}

/**
 * Botón que descarga los datos de una tabla/reporte como CSV (Fase 2 —
 * Exportación). Reutiliza `toCsv`/`downloadCsv`; accesible por teclado y con
 * `aria-label` descriptivo. Deshabilita la exportación si no hay filas.
 */
export function ExportButton<T>({ rows, columns, filename, label = 'Exportar CSV' }: ExportButtonProps<T>) {
  const disabled = rows.length === 0
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => downloadCsv(safeFilename(filename), toCsv(rows, columns))}
      aria-label={disabled ? 'No hay datos para exportar' : `Descargar ${label.toLowerCase()}`}
      className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 dark:border-[#34324a] bg-white dark:bg-[#25293c] text-gray-700 dark:text-[#a6accd] hover:bg-gray-100 dark:hover:bg-[#303348] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#82aaff] focus-visible:ring-offset-1 dark:focus-visible:ring-offset-[#202331] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0 4-4m-4 4-4-4M4 21h16" />
      </svg>
      {label}
    </button>
  )
}