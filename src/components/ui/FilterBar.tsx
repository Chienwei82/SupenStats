import { useId } from 'react'
import type { FondoTipo, DateRange } from '../../types/suppen'
import { OPC_LIST } from '../../constants/suppen'

interface FilterBarProps {
  fondo?: FondoTipo | ''
  onFondoChange?: (fondo: FondoTipo | '') => void
  dateRange?: DateRange
  onDateRangeChange?: (range: DateRange) => void
  showEntidad?: boolean
  entidad?: string
  onEntidadChange?: (entidad: string) => void
}

const FONDOS: { value: FondoTipo | ''; label: string }[] = [
  { value: '', label: 'Todos los fondos' },
  { value: 'ROP', label: 'ROP' },
  { value: 'FCL', label: 'FCL' },
  { value: 'VOL', label: 'Voluntario' },
  { value: 'BASI', label: 'Basico' },
  { value: 'OCUP', label: 'Ocupacional' },
]

export function FilterBar({
  fondo,
  onFondoChange,
  dateRange,
  onDateRangeChange,
  showEntidad = false,
  entidad = '',
  onEntidadChange,
}: FilterBarProps) {
  const hasDateFilter = dateRange && onDateRangeChange
  const hasFondoFilter = fondo !== undefined && onFondoChange !== undefined
  // id único para asociar etiquetas con controles (evita colisiones en la página)
  const uid = useId()
  const fondoId = `${uid}-fondo`
  const fechaInicioId = `${uid}-inicio`
  const fechaFinId = `${uid}-fin`
  const entidadId = `${uid}-entidad`

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3 p-3 bg-gray-50 dark:bg-[#262a3a] rounded-lg border border-gray-200 dark:border-[#34324a]" role="group" aria-label="Filtros del reporte">
      {hasFondoFilter && (
        <div className="flex items-center gap-2">
          <label htmlFor={fondoId} className="text-xs font-medium text-gray-600 dark:text-[#a6accd]">
            Fondo
          </label>
          <select
            id={fondoId}
            value={fondo}
            onChange={(e) => onFondoChange(e.target.value as FondoTipo | '')}
            className="px-3 py-1.5 text-sm bg-white dark:bg-[#25293c] dark:text-[#eeffff] border border-gray-300 dark:border-[#34324a] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#82aaff] focus:border-blue-500"
          >
            {FONDOS.map(f => (
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

      {showEntidad && onEntidadChange && (
        <div className="flex items-center gap-2">
          <label htmlFor={entidadId} className="text-xs font-medium text-gray-600 whitespace-nowrap">
            Operadora
          </label>
          <select
            id={entidadId}
            value={entidad}
            onChange={(e) => onEntidadChange(e.target.value)}
            className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todas las OPC</option>
            {OPC_LIST.map(opc => (
              <option key={opc} value={opc}>{opc}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}
