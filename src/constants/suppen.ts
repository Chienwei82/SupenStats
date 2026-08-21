export const OPC_COLORS: Record<string, string> = {
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
