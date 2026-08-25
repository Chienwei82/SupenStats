import type { FondoTipo } from '../types/suppen'

// Claves canónicas de entidad (las que produce normalizeEntityName).
// Tipar el Record evita que un typo caiga silenciosamente al color fallback.
export type EntityColorKey =
  | 'POPULAR PENSIONES'
  | 'BCR-PENSION'
  | 'BN-VITAL'
  | 'CCSS-OPC'
  | 'VIDA PLENA OPC'
  | 'BAC SJ PENSIONES'
  | 'FONDO IVM-CCSS'
  | 'MAGISTERIO NAL'
  | 'PODER JUDICIAL'
  | 'FONDO BOMBEROS'
  | 'TRANS. MAGIST.'
  | 'FONDO FBNCR'
  | 'FONDO FICE'
  | 'FONDO FRE-CCSS'
  | 'FONDO VEND LOT'

export const OPC_COLORS: Record<EntityColorKey, string> = {
  'POPULAR PENSIONES': '#3b82f6',
  'BCR-PENSION': '#10b981',
  'BN-VITAL': '#f59e0b',
  'CCSS-OPC': '#ef4444',
  'VIDA PLENA OPC': '#8b5cf6',
  'BAC SJ PENSIONES': '#ec4899',
  // Regímenes básicos (fondo BASI)
  'FONDO IVM-CCSS': '#0ea5e9',
  'MAGISTERIO NAL': '#f97316',
  'PODER JUDICIAL': '#14b8a6',
  'FONDO BOMBEROS': '#e11d48',
  'TRANS. MAGIST.': '#a855f7',
  // Regímenes ocupacionales (fondo OCUP)
  'FONDO FBNCR': '#06b6d4',
  'FONDO FICE': '#84cc16',
  'FONDO FRE-CCSS': '#d946ef',
  'FONDO VEND LOT': '#f43f5e',
}

/** Color canónico de una entidad, con fallback seguro si no está mapeada. */
export function entityColor(name: string): string {
  return (OPC_COLORS as Record<string, string>)[name] ?? '#6b7280'
}

// Lista de operadoras de pensiones (OPC) para el filtro de entidad.
// Se mantiene separada de OPC_COLORS porque OPC_COLORS también incluye
// entidades de regímenes básicos y ocupacionales (que no son OPCs y no
// deben aparecer en el dropdown de libre transferencia).
export const OPC_LIST = [
  'POPULAR PENSIONES',
  'BCR-PENSION',
  'BN-VITAL',
  'CCSS-OPC',
  'VIDA PLENA OPC',
  'BAC SJ PENSIONES',
]

// Mapeo de los nombres reales que devuelve la API a los nombres canónicos
// usados en OPC_COLORS. La API usa nombres abreviados como 'POPULAR',
// 'BACSJ PENSIONES' o 'VIDA PLENA'.
export const ENTITY_NAME_MAP: Record<string, string> = {
  'POPULAR': 'POPULAR PENSIONES',
  'POPULAR PENSIONES': 'POPULAR PENSIONES',
  'BACSJ PENSIONES': 'BAC SJ PENSIONES',
  'BAC SJ PENSIONES': 'BAC SJ PENSIONES',
  'BCR-PENSION': 'BCR-PENSION',
  'BN-VITAL': 'BN-VITAL',
  'CCSS-OPC': 'CCSS-OPC',
  'VIDA PLENA': 'VIDA PLENA OPC',
  'VIDA PLENA OPC': 'VIDA PLENA OPC',
  'INS PENSIONES': 'INS PENSIONES',
  'IBP PENSIONES': 'IBP PENSIONES',
  'TOTAL': 'TOTAL',
}

export function normalizeEntityName(name: string): string {
  return ENTITY_NAME_MAP[name] ?? name
}

export const CHART_COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#84cc16',
]

export const FONDO_DEFAULT = 'ROP' as const

// Fondos válidos para /lt (libre transferencia). Verificado contra la API:
// ROP/FCL/VOLCA/VOLCB/VOLDA/VOLDB devuelven datos; BASI/OCUP devuelven 0.
export const LT_FONDO_OPTIONS: { value: FondoTipo | ''; label: string }[] = [
  { value: 'ROP', label: 'ROP (Obligatorio)' },
  { value: 'FCL', label: 'FCL (Compensación)' },
  { value: 'VOLCA', label: 'Voluntario CA' },
  { value: 'VOLCB', label: 'Voluntario CB' },
  { value: 'VOLDA', label: 'Voluntario DA' },
  { value: 'VOLDB', label: 'Voluntario DB' },
]

function isoDate(offsetYears: number): string {
  const d = new Date()
  d.setFullYear(d.getFullYear() - offsetYears)
  return d.toISOString().split('T')[0]
}

function isoDateMonthsOffset(offsetMonths: number): string {
  const d = new Date()
  d.setMonth(d.getMonth() - offsetMonths)
  return d.toISOString().split('T')[0]
}

// Rango por defecto para los reportes históricos: últimos 5 años.
export const DATE_RANGE_DEFAULT = {
  FechaInicio: isoDate(5),
  FechaFinal: new Date().toISOString().split('T')[0],
}

// Comisiones: por defecto mostramos el periodo pre-unificacion (2010-2020)
// para que el usuario vea la diferenciacion historica entre OPCs antes de
// que todas convergieran a 0.35%.
export const COMISION_RANGE = {
  FechaInicio: '2010-01-01',
  FechaFinal: '2020-12-31',
}

// El endpoint de portafolio devuelve datos desde 2010 y es muy pesado
// (55MB sin filtro). Limitamos a los últimos 3 meses para que la consulta
// sea rápida y suficiente para el donut y el gráfico de activos.
export const PORTFOLIO_RANGE = {
  FechaInicio: isoDateMonthsOffset(3),
  FechaFinal: new Date().toISOString().split('T')[0],
}

// El endpoint de portafolioISIN está desactualizado en la fuente: SUPEN
// congeló el detalle por ISIN el 2026-01-31 (verificado el 2026-08-25),
// mientras /portafolio sigue al día. Un rango corto reciente devuelve vacío,
// así que pedimos 12 meses para que el último corte publicado entre en
// ventana. Si SUPEN retoma la publicación esto sigue funcionando.
export const ISIN_LAST_PUBLICATION = '2026-01-31'
export const ISIN_RANGE = {
  FechaInicio: isoDateMonthsOffset(12),
  FechaFinal: new Date().toISOString().split('T')[0],
}
