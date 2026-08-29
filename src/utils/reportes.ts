import type {
  Comision,
  RendimientoComparado,
  RentabilidadComparada,
  RentabilidadSerie,
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

// ---------------------------------------------------------------------------
// Simulador de pensión
// ---------------------------------------------------------------------------

/**
 * Cortes mínimos con rentabilidad no nula para considerar el promedio
 * "confiable". Por debajo de esto se devuelve `promedio = null` y la UI debe
 * mostrar "histórico insuficiente" en vez de usar un valor supuesto.
 */
export const MIN_CORTES_RENTABILIDAD = 12

export interface RentabilidadPromedio {
  /** null = histórico insuficiente (ver MIN_CORTES_RENTABILIDAD). */
  promedio: number | null
  /** Cantidad de cortes con rentabilidad no nula usados en el promedio. */
  nCortes: number
  primerCorte: string | null
  ultimoCorte: string | null
}

/**
 * Promedia la rentabilidad ANUAL de una OPC a lo largo del histórico para usarla
 * como tasa de crecimiento proyectada del simulador. Solo considera registros
 * `periodicidad === 'ANUAL'` y del tipo elegido (nominal por defecto, o real).
 * No inventa: si hay menos de `MIN_CORTES_RENTABILIDAD` cortes con dato, el
 * promedio es `null`.
 */
export function calcularRentabilidadPromedio(
  serie: RentabilidadSerie[],
  opc: string,
  metrica: 'nominal' | 'real' = 'nominal',
): RentabilidadPromedio {
  const tipo = metrica === 'real' ? 'REAL' : 'NOMINAL'
  const valores = serie
    .filter(r => r.Entidad === opc && r.Tipo === tipo && r.Periodicidad === 'ANUAL' && r.Rentabilidad != null)
    .map(r => ({ rent: r.Rentabilidad as number, fecha: r.FechaCorte }))

  const nCortes = valores.length
  if (nCortes < MIN_CORTES_RENTABILIDAD) {
    return { promedio: null, nCortes, primerCorte: null, ultimoCorte: null }
  }
  const promedio = valores.reduce((s, v) => s + v.rent, 0) / nCortes
  const fechas = valores.map(v => v.fecha).sort()
  return {
    promedio,
    nCortes,
    primerCorte: fechas[0],
    ultimoCorte: fechas[fechas.length - 1],
  }
}

export interface ProyeccionPensionParams {
  saldoInicial: number
  aporteMensual: number
  /** Años a proyectar (edadRetiro − edadActual). */
  anios: number
  /** Tasa anual en forma decimal (ej. 0.07 = 7%). */
  tasaAnual: number
  edadActual: number
}

export interface PuntoProyeccion {
  /** Año de la proyección (1 = primer año hasta el retiro). */
  anio: number
  edad: number
  saldo: number
}

export interface ProyeccionPension {
  montoFinal: number
  curva: PuntoProyeccion[]
}

/**
 * Proyección de saldo acumulado con aportes mensuales a fin de mes y
 * capitalización mensual derivada de la tasa anual. Función pura: mismo
 * input ⇒ mismo output. La tasa es la rentabilidad histórica promedio; la UI
 * debe dejar claro que es una proyección, no una garantía.
 */
export function proyeccionPension({
  saldoInicial,
  aporteMensual,
  anios,
  tasaAnual,
  edadActual,
}: ProyeccionPensionParams): ProyeccionPension {
  const i = Math.pow(1 + tasaAnual, 1 / 12) - 1
  let saldo = saldoInicial
  const curva: PuntoProyeccion[] = []
  for (let t = 1; t <= anios; t++) {
    for (let m = 0; m < 12; m++) {
      saldo = saldo * (1 + i) + aporteMensual
    }
    curva.push({ anio: t, edad: edadActual + t, saldo })
  }
  return { montoFinal: curva.length > 0 ? curva[curva.length - 1].saldo : saldoInicial, curva }
}
