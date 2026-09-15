import { z } from 'zod'
import type { FondoTipo, DateRange } from '../types/supen'
import { FONDO_DEFAULT, DATE_RANGE_DEFAULT, PORTFOLIO_RANGE, COMISION_RANGE, ISIN_RANGE, SIMULADOR_RANGE } from './supen'

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
const API_MIN_DATE = '2010-01-01'
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

/**
 * Normaliza una fecha de filtro: vacíos, no-ISO o anteriores a 2010-01-01
 * (la API de SUPEN no publica antes) se convierten en undefined, lo que hace
 * que `resolveFilters` caiga al default del reporte. Enviar sin fechas hace
 * que la API responda todo el histórico desde 2010 (55MB+ en /portafolio),
 * así que es crítico nunca dejar pasar un rango incompleto. La comparación
 * de ISO como string es lexicográfica, válida para YYYY-MM-DD.
 */
export function sanitizeDate(v: string): string | undefined {
  if (!v || !ISO_DATE.test(v)) return undefined
  return v < API_MIN_DATE ? API_MIN_DATE : v
}

export function resolveFilters(
  search: ReportSearchInput,
  defaults: { fondo: FondoTipo | ''; dates?: DateRange },
): { fondo: FondoTipo | ''; dates?: DateRange } {
  const hasDates = defaults.dates !== undefined
  // `??` (no `||`) preserva '' ("Todos los fondos").
  const fondo = (search.fondo as FondoTipo | '' | undefined) ?? defaults.fondo
  if (!hasDates) return { fondo }
  const inicio = sanitizeDate(search.fechaInicio ?? '') ?? defaults.dates!.FechaInicio
  const fin = sanitizeDate(search.fechaFinal ?? '') ?? defaults.dates!.FechaFinal
  // Rango invertido (Inicio > Final): caer a los defaults del reporte.
  if (inicio > fin) {
    return { fondo, dates: { ...defaults.dates! } }
  }
  return { fondo, dates: { FechaInicio: inicio, FechaFinal: fin } }
}
