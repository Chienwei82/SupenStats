import { useId } from 'react'
import { FONDO_OPTIONS } from '../../constants/supen'
import type { FondoTipo, DateRange } from '../../types/supen'

interface FilterBarProps {
  fondo?: FondoTipo | ''
  onFondoChange?: (fondo: FondoTipo | '') => void
  /** Lista de fondos alternativa (ej. /lt usa ROP/FCL/VOLCA/VOLCB/VOLDA/VOLDB). */
  fondoOptions?: { value: FondoTipo | ''; label: string }[]
  dateRange?: DateRange
  onDateRangeChange?: (range: DateRange) => void
  onConsult?: () => void
}

export function FilterBar({
  fondo,
  onFondoChange,
  fondoOptions,
  dateRange,
  onDateRangeChange,
  onConsult,
}: FilterBarProps) {
  const hasDateFilter = dateRange && onDateRangeChange
  const hasFondoFilter = fondo !== undefined && onFondoChange !== undefined
  const fondos = fondoOptions ?? FONDO_OPTIONS
  // id único para asociar etiquetas con controles (evita colisiones en la página)
  const uid = useId()
  const fondoId = `${uid}-fondo`
  const fechaInicioId = `${uid}-inicio`
  const fechaFinId = `${uid}-fin`

  return (
    <form
      className="flex flex-wrap items-center gap-x-4 gap-y-3 p-3 bg-gray-50 dark:bg-[#262a3a] rounded-lg border border-gray-200 dark:border-[#34324a]"
      role="group"
      aria-label="Filtros del reporte"
      onSubmit={(e) => {
        e.preventDefault()
        onConsult?.()
      }}
    >
      {hasFondoFilter && (
        <div className="flex items-center gap-2">
          <label htmlFor={fondoId} className="text-xs font-medium text-gray-600 dark:text-[#a6accd]">
            Fondo
          </label>
          <select
            id={fondoId}
            value={fondo}
            onChange={(e) => onFondoChange(e.target.value as FondoTipo | '')}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onConsult?.() } }}
            className="px-3 py-1.5 text-sm bg-white dark:bg-[#25293c] dark:text-[#eeffff] border border-gray-300 dark:border-[#34324a] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#82aaff] focus:border-blue-500"
          >
            {fondos.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>
      )}

      {hasDateFilter && (
        <>
          <div className="flex items-center gap-2">
            <label htmlFor={fechaInicioId} className="text-xs font-medium text-gray-600 dark:text-[#a6accd] whitespace-nowrap">
              Desde
            </label>
            <input
              id={fechaInicioId}
              type="date"
              value={dateRange.FechaInicio}
              onChange={(e) => onDateRangeChange({ ...dateRange, FechaInicio: e.target.value })}
              className="px-3 py-1.5 text-sm bg-white dark:bg-[#25293c] dark:text-[#eeffff] border border-gray-300 dark:border-[#34324a] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#82aaff] focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor={fechaFinId} className="text-xs font-medium text-gray-600 dark:text-[#a6accd] whitespace-nowrap">
              Hasta
            </label>
            <input
              id={fechaFinId}
              type="date"
              value={dateRange.FechaFinal}
              onChange={(e) => onDateRangeChange({ ...dateRange, FechaFinal: e.target.value })}
              className="px-3 py-1.5 text-sm bg-white dark:bg-[#25293c] dark:text-[#eeffff] border border-gray-300 dark:border-[#34324a] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#82aaff] focus:border-blue-500"
            />
          </div>
        </>
      )}

      {onConsult && (
        <button
          type="submit"
          onClick={onConsult}
          className="ml-auto inline-flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <path strokeLinecap="round" d="M15 11h-8M15 11v-4M15 11v4" />
          </svg>
          Consultar
        </button>
      )}
    </form>
  )
}
