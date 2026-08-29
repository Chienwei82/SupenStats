import type { AfiliadoMensual, RawAfiliado, RawLibreTransferencia, TrasladoBalance, TrasladoFlujo, VariacionPunto } from '../types/suppen'
import { normalizeEntityName } from '../constants/suppen'

/**
 * Construye la serie mensual de afiliados por OPC preservando null cuando la
 * API no trae dato. A diferencia de `transformAfiliados`, NUNCA convierte
 * null en 0: el reporte de traslados necesita distinguir "no disponible" de 0
 * para que las variaciones no se inventen.
 *
 * Regla: si TODOS los registros de `(entidad, fecha, fondo)` son null, la
 * celda queda `null`; si al menos uno trae un número, se suman los no-null
 * y se descartan los null.
 */
export function construirSerieAfiliadosPorOpc(raw: RawAfiliado[]): AfiliadoMensual[] {
  interface Acc {
    entidad: string
    fondo: string
    fecha: string
    sum: number
    allNull: boolean
  }
  const map = new Map<string, Acc>()
  for (const item of raw) {
    const entidad = normalizeEntityName(item.entidad)
    const fecha = String(item.fecha ?? '')
    const key = `${entidad}|${fecha}|${item.codigofondo}`
    const existing = map.get(key) ?? {
      entidad,
      fondo: item.codigofondo,
      fecha,
      sum: 0,
      allNull: true,
    }
    if (item.afiliados != null) {
      existing.sum += item.afiliados
      existing.allNull = false
    }
    map.set(key, existing)
  }
  return Array.from(map.values()).map(a => ({
    Entidad: a.entidad,
    Fondo: a.fondo,
    FechaCorte: a.fecha,
    CantidadAfiliados: a.allNull ? null : a.sum,
  }))
}

/**
 * Calcula la variación mes a mes por OPC a partir de la serie de afiliados.
 * - `metrica: 'abs'`: devuelve `afiliados(t) - afiliados(t-1)` (en personas).
 * - `metrica: 'pct'`: devuelve `(t - t-1) / t-1 * 100` (en porcentaje).
 *
 * Si falta el dato en t o en t-1, el delta es `null` (NO se rellena con 0
 * ni con el valor anterior). El primer mes disponible de cada OPC tampoco
 * tiene delta.
 *
 * Devuelve un punto por fecha observada (unión de todas las fechas de la
 * serie, ordenadas asc). Cada punto incluye `fecha` y una entrada por OPC
 * con el delta (o null).
 */
export function calcularVariacionNeta(
  serie: AfiliadoMensual[],
  metrica: 'abs' | 'pct' = 'abs',
): VariacionPunto[] {
  // Agrupa por entidad, ordenado por fecha.
  const porEntidad = new Map<string, AfiliadoMensual[]>()
  for (const s of serie) {
    const list = porEntidad.get(s.Entidad) ?? []
    list.push(s)
    porEntidad.set(s.Entidad, list)
  }
  for (const list of porEntidad.values()) {
    list.sort((a, b) => parseDateMs(a.FechaCorte) - parseDateMs(b.FechaCorte))
  }

  // Conjunto de fechas, ordenadas asc.
  const fechasSet = new Set<string>()
  for (const s of serie) fechasSet.add(s.FechaCorte)
  const fechas = [...fechasSet].sort((a, b) => parseDateMs(a) - parseDateMs(b))

  // Para cada entidad, precomputamos un mapa fecha -> valor.
  const porEntidadFecha = new Map<string, Map<string, number | null>>()
  for (const [ent, list] of porEntidad) {
    const m = new Map<string, number | null>()
    for (const s of list) m.set(s.FechaCorte, s.CantidadAfiliados)
    porEntidadFecha.set(ent, m)
  }

  const puntos: VariacionPunto[] = fechas.map(fecha => {
    const idx = fechas.indexOf(fecha)
    const fechaPrev = idx > 0 ? fechas[idx - 1]! : null
    const punto: VariacionPunto = { fecha }
    for (const ent of porEntidad.keys()) {
      const m = porEntidadFecha.get(ent)!
      const actual = m.get(fecha) ?? null
      const prev = fechaPrev ? (m.get(fechaPrev) ?? null) : null
      punto[ent] = calcularDelta(actual, prev, metrica)
    }
    return punto
  })
  return puntos
}

function parseDateMs(dateStr: string): number {
  if (!dateStr) return 0
  // La API usa 'YYYY-MM-DDTHH:MM:SS' o 'YYYY-MM-DD'.
  const ms = Date.parse(dateStr)
  return Number.isNaN(ms) ? 0 : ms
}

function calcularDelta(
  actual: number | null,
  prev: number | null,
  metrica: 'abs' | 'pct',
): number | null {
  if (actual == null || prev == null) return null
  if (metrica === 'pct') {
    if (prev === 0) return null // % indefinido
    return ((actual - prev) / prev) * 100
  }
  return actual - prev
}

// ---------------------------------------------------------------------------
// Libre transferencia (matriz cruda)
// ---------------------------------------------------------------------------

/** Claves canónicas de las columnas destino en /lt (en el orden que expone
 *  la API; ver docs/docs/api-notes.md). Se conservan exactamente como llegan
 *  (con guion bajo) porque el `RawLibreTransferencia` las usa tal cual. */
const LT_DEST_KEYS = [
  'BN_VITAL',
  'INS_PENSIONES',
  'POPULAR',
  'VIDA_PLENA',
  'IBP_PENSIONES',
  'BACSJ_PENSIONES',
  'BCR_PENSION',
  'CCSS_OPC',
] as const

/**
 * Construye el balance neto (ingresos - salidas) por OPC y mes a partir de
 * la matriz cruda de /lt.
 * - Ingresos: suma de la columna `{ORIG}_C` recorrida para todas las filas
 *   (todas origenes), en esa fecha.
 * - Salidas: suma de la fila cuando `entidadorigen = ORIG`, en esa fecha,
 *   excluyendo la diagonal (ORIG -> ORIG, que siempre es 0 pero por las
 *   dudas la descartamos).
 *
 * Devuelve una lista plana `(fecha, OPC)` apta para graficar.
 */
export function construirBalanceTraslados(
  raw: RawLibreTransferencia[],
): TrasladoBalance[] {
  // Ingresos por (destino, fecha): suma de la columna {DEST}_C sobre todas
  // las filas (origenes). La columna existe aunque ORIG sea igual a DEST;
  // para "ingresos" eso es un auto-traslado que no debería contarse como
  // ingreso real, pero /lt en realidad trae 0 en la diagonal (verificado),
  // así que no hace falta descartarla acá. Si en algún caso trae valor, la
  // métrica igual lo reflejaría como ingreso, que es lo que reporta SUPEN.
  interface Acc {
    fecha: string
    ingresos: Map<string, number>
    salidas: Map<string, number>
  }
  const porFecha = new Map<string, Acc>()

  const ensure = (fecha: string): Acc => {
    let acc = porFecha.get(fecha)
    if (!acc) {
      acc = { fecha, ingresos: new Map(), salidas: new Map() }
      porFecha.set(fecha, acc)
    }
    return acc
  }

  for (const item of raw) {
    const fecha = String(item.fecha ?? '')
    if (!fecha) continue
    const acc = ensure(fecha)
    const origen = normalizarOrigen(String(item.entidadorigen ?? ''))
    // origenKey es la clave de columna en /lt que corresponde al origen.
    // Devuelve null cuando la entidad origen no está mapeada (ej. INS PENSIONES
    // o IBP PENSIONES, que aparecen en algunas filas de la API pero no son
    // OPCs "destino" en la matriz). En ese caso no podemos detectar la
    // diagonal: la dejamos pasar y confiamos en que /lt traiga 0 en la celda
    // diagonal (verificado contra la API).
    const origenKey = origenToKey(origen)

    // Salidas del origen: suma de todas las celdas {DEST}_C de la fila.
    let salidasOrig = 0
    for (const dest of LT_DEST_KEYS) {
      const v = Number(item[`${dest}_C`] ?? 0)
      if (!Number.isFinite(v)) continue
      // Excluir la diagonal para que "salidas" no incluya auto-traslados.
      if (origenKey != null && dest === origenKey) continue
      salidasOrig += v
    }
    if (salidasOrig > 0) {
      acc.salidas.set(origen, (acc.salidas.get(origen) ?? 0) + salidasOrig)
    }

    // Ingresos: para cada columna {DEST}_C en esta fila, el DEST recibe `v`
    // ingresos (siempre que sea > 0). Excluimos la diagonal si la podemos
    // detectar.
    for (const dest of LT_DEST_KEYS) {
      const v = Number(item[`${dest}_C`] ?? 0)
      if (!Number.isFinite(v) || v === 0) continue
      if (origenKey != null && dest === origenKey) continue
      const destino = LT_DEST_KEY_TO_CANONICAL[dest]
      acc.ingresos.set(destino, (acc.ingresos.get(destino) ?? 0) + v)
    }
  }

  // Construir lista plana. Una entrada por (fecha, OPC) que tenga al menos
  // un movimiento en esa fecha (ingresos > 0 o salidas > 0). Conservamos el
  // cero explícito cuando ambos son 0 (puede pasar si /lt no trae la fila
  // de un origen para ese mes: entonces no generamos entrada, lo cual es
  // correcto para que el chart muestre hueco).
  const balances: TrasladoBalance[] = []
  const fechasOrd = [...porFecha.keys()].sort((a, b) => parseDateMs(a) - parseDateMs(b))
  for (const fecha of fechasOrd) {
    const acc = porFecha.get(fecha)!
    const opcs = new Set([...acc.ingresos.keys(), ...acc.salidas.keys()])
    for (const opc of opcs) {
      const ingresos = acc.ingresos.get(opc) ?? 0
      const salidas = acc.salidas.get(opc) ?? 0
      if (ingresos === 0 && salidas === 0) continue
      balances.push({
        fecha,
        Entidad: opc,
        Ingresos: ingresos,
        Salidas: salidas,
        Neto: ingresos - salidas,
      })
    }
  }
  return balances
}

/**
 * Agrega los flujos origen→destino en todo el rango. Excluye la diagonal y
 * los flujos con cantidad 0.
 */
export function agregarFlujosPorOrigenDestino(
  raw: RawLibreTransferencia[],
): TrasladoFlujo[] {
  interface Acc {
    origen: string
    destino: string
    cantidad: number
    monto: number
  }
  const map = new Map<string, Acc>()
  for (const item of raw) {
    const fecha = String(item.fecha ?? '')
    if (!fecha) continue
    const origenRaw = String(item.entidadorigen ?? '')
    const origen = normalizarOrigen(origenRaw)
    const origenKey = origenToKey(origen)
    for (const dest of LT_DEST_KEYS) {
      const cantidad = Number(item[`${dest}_C`] ?? 0)
      const monto = Number(item[`${dest}_M`] ?? 0)
      if (!Number.isFinite(cantidad) || cantidad === 0) continue
      // Diagonal: solo la excluimos si podemos detectarla (origenKey != null).
      // Para entidades no mapeadas (ej. INS PENSIONES) confiamos en que /lt
      // traiga 0 en la celda diagonal, así que la dejamos pasar.
      if (origenKey != null && dest === origenKey) continue
      const destino = LT_DEST_KEY_TO_CANONICAL[dest]
      const key = `${origen}|${destino}|${fecha}`
      const existing = map.get(key) ?? { origen, destino, cantidad: 0, monto: 0 }
      existing.cantidad += cantidad
      existing.monto += Number.isFinite(monto) ? monto : 0
      map.set(key, existing)
    }
  }
  // Acumular por par (origen, destino) en todo el rango.
  const totales = new Map<string, TrasladoFlujo>()
  for (const a of map.values()) {
    const key = `${a.origen}|${a.destino}`
    const existing = totales.get(key) ?? { Origen: a.origen, Destino: a.destino, Cantidad: 0, Monto: 0 }
    existing.Cantidad += a.cantidad
    existing.Monto += a.monto
    totales.set(key, existing)
  }
  return [...totales.values()].sort((a, b) => b.Cantidad - a.Cantidad)
}

/**
 * Devuelve la clave de columna en /lt que corresponde a una OPC canónica, o
 * null si la entidad no aparece como destino en la matriz. Implementado por
 * iteración sobre `LT_DEST_KEYS` (8 entradas) en vez de un map inverso con
 * `as` cast, para que un typo futuro sea visible.
 */
function origenToKey(nombreCanonico: string): (typeof LT_DEST_KEYS)[number] | null {
  for (const k of LT_DEST_KEYS) {
    if (LT_DEST_KEY_TO_CANONICAL[k] === nombreCanonico) return k
  }
  return null
}

/** Normaliza la `entidadorigen` de /lt a su nombre canónico, o devuelve
 *  el original si no hay mapeo (ej. INS PENSIONES, IBP PENSIONES). */
function normalizarOrigen(origenRaw: string): string {
  // /lt a veces entrega "POPULAR" (sin PENSIONES) o "VIDA_PLENA" (sin OPC y
  // con guion bajo). Mapeamos al nombre canónico de la app para que las
  // leyendas y KPIs coincidan con el resto de la UI.
  const M: Record<string, string> = {
    POPULAR: 'POPULAR PENSIONES',
    VIDA_PLENA: 'VIDA PLENA OPC',
    'VIDA PLENA': 'VIDA PLENA OPC',
    'BACSJ PENSIONES': 'BAC SJ PENSIONES',
  }
  return M[origenRaw] ?? origenRaw
}

/** Mapea la clave de columna (destino) en /lt al nombre canónico de la OPC. */
const LT_DEST_KEY_TO_CANONICAL: Record<(typeof LT_DEST_KEYS)[number], string> = {
  BN_VITAL: 'BN-VITAL',
  INS_PENSIONES: 'INS PENSIONES',
  POPULAR: 'POPULAR PENSIONES',
  VIDA_PLENA: 'VIDA PLENA OPC',
  IBP_PENSIONES: 'IBP PENSIONES',
  BACSJ_PENSIONES: 'BAC SJ PENSIONES',
  BCR_PENSION: 'BCR-PENSION',
  CCSS_OPC: 'CCSS-OPC',
}
