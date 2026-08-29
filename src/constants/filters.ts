import { z } from 'zod'
import type { FondoTipo, DateRange } from '../types/suppen'
import { FONDO_DEFAULT, DATE_RANGE_DEFAULT, PORTFOLIO_RANGE, COMISION_RANGE, ISIN_RANGE, SIMULADOR_RANGE } from './suppen'

/**
 * Esquema de search params de filtros para las rutas de reportes.
 * Todos los campos son opcionales: al faltar se aplican los defaults del
 * reporte. Esto permite URLs compartibles tipo /portafolio?fondo=FCL&...
 */
export const reportSearchSchema = z.object({
  fondo: z.string().optional(),
  fechaInicio: z.string().optional(),
  fechaFinal: z.string().optional(),
  // Params extra de los reportes de rentabilidad/comisiones. Opcionales y
  // validados al consumirlos; al faltar aplican los defaults del componente.
  periodicidad: z.string().optional(),
  corte: z.string().optional(),
  metrica: z.enum(['nominal', 'real']).optional(),
  // OPC de referencia del simulador (selector propio, no es filtro de API).
  entidad: z.string().optional(),
})

export type ReportSearchInput = z.infer<typeof reportSearchSchema>

/** Defaults por reporte (equivalen a los que antes vivían en App.tsx). */
export const FILTER_DEFAULTS = {
  standard: { fondo: FONDO_DEFAULT as FondoTipo | '', dates: DATE_RANGE_DEFAULT as DateRange },
  comision: { fondo: FONDO_DEFAULT as FondoTipo | '', dates: COMISION_RANGE as DateRange },
  portafolio: { fondo: FONDO_DEFAULT as FondoTipo | '', dates: PORTFOLIO_RANGE as DateRange },
  isin: { fondo: FONDO_DEFAULT as FondoTipo | '', dates: ISIN_RANGE as DateRange },
  lt: { fondo: 'ROP' as FondoTipo | '', dates: DATE_RANGE_DEFAULT as DateRange },
  simulador: { fondo: 'ROP' as FondoTipo | '', dates: SIMULADOR_RANGE as DateRange },
  noDates: { fondo: FONDO_DEFAULT as FondoTipo | '' },
}

/**
 * Resuelve los filtros efectivos de una ruta: search params si están
 * presentes, defaults del reporte si no.
 */
export function resolveFilters(
  search: ReportSearchInput,
  defaults: { fondo: FondoTipo | ''; dates?: DateRange },
): { fondo: FondoTipo | ''; dates?: DateRange } {
  const hasDates = defaults.dates !== undefined
  return {
    fondo: (search.fondo as FondoTipo | undefined) ?? defaults.fondo,
    dates: hasDates
      ? {
          FechaInicio: search.fechaInicio ?? defaults.dates!.FechaInicio,
          FechaFinal: search.fechaFinal ?? defaults.dates!.FechaFinal,
        }
      : undefined,
  }
}
