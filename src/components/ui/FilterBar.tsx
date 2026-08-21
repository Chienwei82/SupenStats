import type { FondoTipo, DateRange } from '../../types/suppen'
import { OPC_LIST } from '../../constants/suppen'

interface FilterBarProps {
  fondo: FondoTipo | ''
  onFondoChange: (fondo: FondoTipo | '') => void
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

  return (
    <div className="flex flex-wrap items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Filtros:</label>

      <select
        value={fondo}
        onChange={(e) => onFondoChange(e.target.value as FondoTipo | '')}
        className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {FONDOS.map(f => (
          <option key={f.value} value={f.value}>{f.label}</option>
        ))}
      </select>

      {hasDateFilter && (
        <>
          <input
            type="date"
            value={dateRange.FechaInicio}
            onChange={(e) => onDateRangeChange({ ...dateRange, FechaInicio: e.target.value })}
            className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <span className="text-gray-400">a</span>
          <input
            type="date"
            value={dateRange.FechaFinal}
            onChange={(e) => onDateRangeChange({ ...dateRange, FechaFinal: e.target.value })}
            className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </>
      )}

      {showEntidad && onEntidadChange && (
        <select
          value={entidad}
          onChange={(e) => onEntidadChange(e.target.value)}
          className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Todas las OPC</option>
          {OPC_LIST.map(opc => (
            <option key={opc} value={opc}>{opc}</option>
          ))}
        </select>
      )}
    </div>
  )
}
