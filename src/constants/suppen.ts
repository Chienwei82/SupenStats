export const OPC_COLORS: Record<string, string> = {
  'POPULAR PENSIONES': '#3b82f6',
  'BCR-PENSION': '#10b981',
  'BN-VITAL': '#f59e0b',
  'CCSS-OPC': '#ef4444',
  'VIDA PLENA OPC': '#8b5cf6',
  'BAC SJ PENSIONES': '#ec4899',
}

export const OPC_LIST = Object.keys(OPC_COLORS)

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

// El endpoint de portafolio devuelve datos desde 2010 y es muy pesado
// (55MB sin filtro). Limitamos a los últimos 3 meses para que la consulta
// sea rápida y suficiente para el donut y el gráfico de activos.
export const PORTFOLIO_RANGE = {
  FechaInicio: isoDateMonthsOffset(3),
  FechaFinal: new Date().toISOString().split('T')[0],
}
