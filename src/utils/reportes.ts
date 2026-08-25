import type {
  Comision,
  RendimientoComparado,
  RentabilidadComparada,
  PuntoComisionRentabilidad,
  ExcluidoComisionRentabilidad,
} from '../types/suppen'

// Periodicidades que expone la API de rendimiento, en orden de presentación.
export const PERIODICIDADES = ['ANUAL', '3 AÑOS', '5 AÑOS', '10 AÑOS', 'HISTÓRICA'] as const

/**
 * Devuelve los cortes (fechas) disponibles para una periodicidad, ordenados asc.
 */
export function cortesDisponibles(
  rendimientos: RendimientoComparado[],
  periodicidad: string,
): string[] {
  return [...new Set(
    rendimientos
      .filter(r => r.Periodicidad === periodicidad)
      .map(r => r.FechaCorte),
  )].sort()
}

/**
 * Pivotea los rendimientos de una (periodicidad, corte) a una fila por OPC con
 * { Nominal, Real }. Las OPC sin dato real conservan Real: null — el llamador
 * debe representar eso como "no disponible", nunca como 0.
 */
export function compararRendimientos(
  rendimientos: RendimientoComparado[],
  periodicidad: string,
  corte: string,
): RentabilidadComparada[] {
  const map = new Map<string, RentabilidadComparada>()
  for (const r of rendimientos) {
    if (r.Periodicidad !== periodicidad || r.FechaCorte !== corte) continue
    // La clave incluye Fondo: si la respuesta mezclara fondos no debemos
    // colapsarlos bajo la misma entidad (R2.3).
    const key = `${r.Fondo}|${r.Entidad}`
    const existing = map.get(key) ?? {
      Entidad: r.Entidad,
      Fondo: r.Fondo,
      FechaCorte: corte,
      Periodicidad: periodicidad,
      Nominal: null,
      Real: null,
    }
    if (r.Nominal != null) existing.Nominal = r.Nominal
    if (r.Real != null) existing.Real = r.Real
    map.set(key, existing)
  }
  return [...map.values()].sort((a, b) => a.Entidad.localeCompare(b.Entidad))
}

/**
 * Empareja comisión sobre saldo con rentabilidad por OPC en el corte más
 * reciente común a ambas fuentes. Los pares incompletos se devuelven aparte
 * con el motivo, para que la UI pueda listarlos en vez de omitirlos.
 */
export function joinComisionConRentabilidad(
  comisiones: Comision[],
  rendimientos: RendimientoComparado[],
  periodicidad: string,
  /** Métrica de rentabilidad para el eje Y del scatter. Default: nominal. */
  metrica: 'nominal' | 'real' = 'nominal',
): {
  corte: string | null
  puntos: PuntoComisionRentabilidad[]
  excluidos: ExcluidoComisionRentabilidad[]
} {
  const fechasComision = new Set(comisiones.map(c => c.FechaCorte))
  const cortesComunes = [...new Set(
    rendimientos
      .filter(r => r.Periodicidad === periodicidad && fechasComision.has(r.FechaCorte))
      .map(r => r.FechaCorte),
  )].sort()
  if (cortesComunes.length === 0) return { corte: null, puntos: [], excluidos: [] }
  const corte = cortesComunes.at(-1)!

  // Igual que en compararRendimientos, la clave incluye Fondo para no mezclar
  // fondos distintos bajo la misma entidad (R2.3).
  const comisionEnCorte = new Map<string, number>()
  for (const c of comisiones) {
    if (c.FechaCorte === corte && c.ComisionTotal != null) {
      comisionEnCorte.set(`${c.Fondo}|${c.Entidad}`, c.ComisionTotal)
    }
  }
  const rendimientoEnCorte = new Map<string, { nominal: number | null; real: number | null }>()
  for (const r of rendimientos) {
    if (r.Periodicidad === periodicidad && r.FechaCorte === corte) {
      rendimientoEnCorte.set(`${r.Fondo}|${r.Entidad}`, { nominal: r.Nominal, real: r.Real })
    }
  }

  const puntos: PuntoComisionRentabilidad[] = []
  const excluidos: ExcluidoComisionRentabilidad[] = []
  const claves = new Set([...comisionEnCorte.keys(), ...rendimientoEnCorte.keys()])
  const motivoSinRentabilidad = metrica === 'real' ? 'sin rentabilidad real' : 'sin rentabilidad'
  for (const clave of claves) {
    const comision = comisionEnCorte.get(clave)
    const rendimiento = rendimientoEnCorte.get(clave)
    const entidad = clave.split('|').slice(1).join('|')
    if (comision == null) {
      excluidos.push({ Entidad: entidad, Motivo: 'sin comisión' })
      continue
    }
    const valor = rendimiento?.[metrica] ?? null
    if (rendimiento == null || valor == null) {
      excluidos.push({ Entidad: entidad, Motivo: motivoSinRentabilidad })
      continue
    }
    puntos.push({
      Entidad: entidad,
      Comision: comision,
      Rentabilidad: valor,
    })
  }
  return { corte, puntos, excluidos }
}

/**
 * Regresión lineal simple por mínimos cuadrados sobre los puntos del scatter.
 * Devuelve null si no hay al menos 2 puntos o si la varianza de X es 0
 * (todas las comisiones iguales ⇒ no hay tendencia calculable).
 */
export function regresionLineal(
  puntos: PuntoComisionRentabilidad[],
): { pendiente: number; intercepto: number; r: number } | null {
  const n = puntos.length
  if (n < 2) return null
  const sumX = puntos.reduce((s, p) => s + p.Comision, 0)
  const sumY = puntos.reduce((s, p) => s + p.Rentabilidad, 0)
  const meanX = sumX / n
  const meanY = sumY / n
  let sxy = 0
  let sxx = 0
  let syy = 0
  for (const p of puntos) {
    sxy += (p.Comision - meanX) * (p.Rentabilidad - meanY)
    sxx += (p.Comision - meanX) ** 2
    syy += (p.Rentabilidad - meanY) ** 2
  }
  if (sxx === 0) return null
  const pendiente = sxy / sxx
  const intercepto = meanY - pendiente * meanX
  // Con var(Y)=0 (todas las rentabilidades iguales) r no está definido;
  // devolver 0 implicaría "sin correlación", que sería un dato inventado.
  if (syy === 0) return null
  const r = sxy / Math.sqrt(sxx * syy)
  return { pendiente, intercepto, r }
}
