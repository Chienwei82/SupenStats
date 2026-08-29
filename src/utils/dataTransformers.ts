export function parseDate(dateStr: string): Date {
  if (!dateStr) return new Date()
  if (dateStr.includes('T')) return new Date(dateStr)
  const parts = dateStr.split(/[/\-\.]/)
  if (parts.length === 3) {
    const [a, b, c] = parts.map(Number)
    // Formato SUPEN típico: YYYY-MM-DD o DD/MM/YYYY.
    // - Si el primer número tiene 4 dígitos → YYYY-MM-DD.
    // - Si el tercero tiene 4 dígitos → DD/MM/YYYY (formato local).
    if (a > 31 || String(parts[0]).length === 4) return new Date(a, b - 1, c)
    if (c > 31 || String(parts[2]).length === 4) return new Date(c, b - 1, a)
    return new Date(a, b - 1, c)
  }
  return new Date(dateStr)
}

export function formatDate(dateStr: string): string {
  const d = parseDate(dateStr)
  return d.toLocaleDateString('es-CR', { year: 'numeric', month: 'short' })
}

export function formatDateShort(dateStr: string): string {
  const d = parseDate(dateStr)
  return d.toLocaleDateString('es-CR', { year: '2-digit', month: '2-digit' })
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CR', {
    style: 'currency',
    currency: 'CRC',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatCurrencyMillions(value: number): string {
  const millions = value / 1_000_000
  return `₡${millions.toFixed(1)}M`
}

export function formatCurrencyBillions(value: number): string {
  const billions = value / 1_000_000_000
  return `₡${billions.toFixed(2)}B`
}

export function formatPercent(value: number): string {
  return `${Number(value ?? 0).toFixed(2)}%`
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('es-CR').format(Number(value ?? 0))
}

export function sortByDateAsc<T>(data: T[], dateKey: keyof T): T[] {
  return [...data].sort((a, b) => {
    const da = parseDate(String(a[dateKey])).getTime()
    const db = parseDate(String(b[dateKey])).getTime()
    return da - db
  })
}

export function groupBy<T>(data: T[], key: keyof T): Record<string, T[]> {
  return data.reduce((acc, item) => {
    const k = String(item[key])
    if (!acc[k]) acc[k] = []
    acc[k].push(item)
    return acc
  }, {} as Record<string, T[]>)
}

export function getUniqueValues<T>(data: T[], key: keyof T): string[] {
  return [...new Set(data.map(item => String(item[key])))]
}

export function calculateAverage(data: number[]): number {
  if (data.length === 0) return 0
  return data.reduce((sum, v) => sum + v, 0) / data.length
}

export function findMax<T>(data: T[], key: keyof T): T | undefined {
  if (data.length === 0) return undefined
  return data.reduce((max, item) => {
    const maxVal = Number(max[key])
    const itemVal = Number(item[key])
    return itemVal > maxVal ? item : max
  }, data[0])
}

export function findMin<T>(data: T[], key: keyof T): T | undefined {
  if (data.length === 0) return undefined
  return data.reduce((min, item) => {
    const minVal = Number(min[key])
    const itemVal = Number(item[key])
    return itemVal < minVal ? item : min
  }, data[0])
}

// ---------------------------------------------------------------------------
// Transformadores de la API real de SUPEN
// La API devuelve los datos con campos en minúscula y una estructura distinta
// a la que los componentes esperan (PascalCase). Estas funciones convierten la
// respuesta cruda al shape de dominio.
// ---------------------------------------------------------------------------

import type {
  Comision, Rendimiento, RendimientoComparado, RentabilidadSerie, Portafolio, Afiliado, AfiliadoMensual,
  AfiliadoAportante, AfiliadoDemografico, Beneficio, BeneficioDemografico, Cuenta, LibreTransferencia, PortafolioISIN,
  RawComision, RawRendimiento, RawPortafolio, RawAfiliado,
  RawBeneficio, RawCuenta, RawLibreTransferencia, RawPortafolioISIN,
} from '../types/supen'
import { LT_DEST_KEYS, normalizeEntityName } from '../constants/supen'

// Periodicidad por defecto para el rendimiento. La API devuelve varias
// periodicidades (ANUAL, 3 AÑOS, 5 AÑOS, 10 AÑOS, HISTÓRICA). Usamos ANUAL
// para el gráfico de línea de tiempo.
const RENDIMIENTO_PERIODICIDAD = 'ANUAL'

export function transformPortafolio(raw: RawPortafolio): Portafolio {
  return {
    Entidad: normalizeEntityName(raw.entidad),
    Fondo: raw.codigofondo,
    FechaCorte: raw.fecha,
    TipoInstrumento: raw.instrumento,
    Monto: raw.montocolones ?? 0,
  }
}

export function transformComisiones(raw: RawComision[]): Comision[] {
  // La API devuelve un registro por tipo (APORTE/RENDIMIENTO/SALDO).
  // Para el dashboard de comisiones de administración usamos la comisión
  // de SALDO, que es la que aplica sobre el saldo administrado.
  // Devolvemos la serie histórica (un registro por entidad y fecha de corte)
  // para que el gráfico pueda mostrar la evolución en el tiempo.
  const map = new Map<string, Comision>()
  for (const item of raw) {
    if (item.tipo !== 'SALDO') continue
    const entidad = normalizeEntityName(item.entidad)
    const key = `${entidad}|${item.fecha}`
    const existing = map.get(key) ?? {
      Entidad: entidad,
      Fondo: item.codigofondo,
      FechaCorte: item.fecha,
      ComisionTotal: null,
    }
    // Preservamos null cuando la API no trae el valor: convertirlo a 0
    // inventaría un dato (p. ej., APORTE/RENDIMIENTO vienen null en ROP).
    existing.ComisionTotal = item['comisión'] ?? null
    map.set(key, existing)
  }
  return Array.from(map.values())
}

export function transformRendimientos(raw: RawRendimiento[]): Rendimiento[] {
  // La API devuelve un registro por tipo (NOMINAL/REAL) y periodicidad.
  // Combinamos NOMINAL y REAL de la periodicidad ANUAL en un solo objeto
  // por (entidad, fecha) para que los gráficos tengan ambos valores.
  const map = new Map<string, Rendimiento>()
  for (const item of raw) {
    if (item.periodicidad !== RENDIMIENTO_PERIODICIDAD) continue
    const key = `${normalizeEntityName(item.entidad)}|${item.fecha}`
    const existing = map.get(key) ?? {
      Entidad: normalizeEntityName(item.entidad),
      Fondo: item.codigofondo,
      FechaCorte: item.fecha,
      RendimientoNominal: 0,
      RendimientoReal: 0,
      ValorCuota: 0,
    }
    if (item.tipo === 'NOMINAL') existing.RendimientoNominal = item.rentabilidad ?? 0
    if (item.tipo === 'REAL') existing.RendimientoReal = item.rentabilidad ?? 0
    map.set(key, existing)
  }
  return Array.from(map.values())
}

export function transformRendimientosComparados(raw: RawRendimiento[]): RendimientoComparado[] {
  // Igual que transformRendimientos pero: (1) conserva TODAS las periodicidades
  // y (2) preserva null cuando la API no trae el valor. El reporte necesita
  // distinguir "no disponible" de 0 para poder mostrarlo explícitamente.
  return raw.map(item => {
    // Normalizamos tipo (uppercase-trim): la API podría devolver variaciones
    // de casing/espacios y una comparación cruda perdería el dato silenciosamente.
    const tipo = item.tipo?.trim().toUpperCase()
    return {
      Entidad: normalizeEntityName(item.entidad),
      Fondo: item.codigofondo,
      FechaCorte: item.fecha,
      Periodicidad: item.periodicidad.trim(),
      Nominal: tipo === 'NOMINAL' ? item.rentabilidad : null,
      Real: tipo === 'REAL' ? item.rentabilidad : null,
    }
  })
}

export function transformPortafolios(raw: RawPortafolio[]): Portafolio[] {
  return raw.map(transformPortafolio)
}

export function transformAfiliados(raw: RawAfiliado[]): Afiliado[] {
  // La API devuelve afiliados desglosados por sexo y rango de edad.
  // Sumamos los afiliados por (entidad, fecha) para obtener el total por OPC.
  const map = new Map<string, Afiliado>()
  for (const item of raw) {
    const entidad = normalizeEntityName(item.entidad)
    const key = `${entidad}|${item.fecha}`
    const existing = map.get(key) ?? {
      Entidad: entidad,
      Fondo: item.codigofondo,
      FechaCorte: item.fecha,
      CantidadAfiliados: 0,
      MontoAportes: 0,
    }
    existing.CantidadAfiliados += item.afiliados ?? 0
    map.set(key, existing)
  }
  return Array.from(map.values())
}

/**
 * Igual que `transformAfiliados` pero preserva null: si TODOS los registros
 * de un (entidad, fecha, fondo) vienen con `afiliados` null, la celda queda
 * null; si solo alguno es null, se suman los no-null. Nunca se representa
 * null como 0. Usado por el reporte de traslados, donde la variación neta
 * entre meses necesita distinguir "no disponible" de 0 para no inventar
 * datos. No muta el comportamiento de los demás reportes.
 */
export function transformAfiliadosMensual(raw: RawAfiliado[]): AfiliadoMensual[] {
  interface Acc { entidad: string; fondo: string; fecha: string; sum: number; allNull: boolean }
  const map = new Map<string, Acc>()
  for (const item of raw) {
    const entidad = normalizeEntityName(item.entidad)
    const fecha = String(item.fecha ?? '')
    const key = `${entidad}|${fecha}|${item.codigofondo}`
    const existing = map.get(key) ?? {
      entidad, fondo: item.codigofondo, fecha, sum: 0, allNull: true,
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

export function transformAfiliadosAportantes(raw: RawAfiliado[]): AfiliadoAportante[] {
  // Preserva tanto afiliados como aportantes por (entidad, fecha, fondo).
  // La tasa AFILIADOS/APORTANTES es clave para medir salud del sistema.
  const map = new Map<string, AfiliadoAportante>()
  for (const item of raw) {
    const entidad = normalizeEntityName(item.entidad)
    const key = `${entidad}|${item.fecha}|${item.codigofondo}`
    const existing = map.get(key) ?? {
      Entidad: entidad,
      Fondo: item.codigofondo,
      FechaCorte: item.fecha,
      CantidadAfiliados: 0,
      CantidadAportantes: 0,
    }
    existing.CantidadAfiliados += item.afiliados ?? 0
    existing.CantidadAportantes += item.aportantes ?? 0
    map.set(key, existing)
  }
  return Array.from(map.values())
}

function normalizeSexo(sexo: string, codigosexo: string): string {
  if (codigosexo === 'F' || codigosexo === 'M') {
    return codigosexo === 'F' ? 'Femenino' : 'Masculino'
  }
  const s = sexo.trim().toUpperCase()
  return s.startsWith('F') ? 'Femenino' : s.startsWith('M') ? 'Masculino' : s
}

export function transformAfiliadosDemograficos(raw: RawAfiliado[]): AfiliadoDemografico[] {
  // Desglose por sexo y rango de edad (sin perder la demografía,
  // que transformAfiliados descarta al sumar por entidad+fecha).
  const map = new Map<string, AfiliadoDemografico>()
  for (const item of raw) {
    const entidad = normalizeEntityName(item.entidad)
    const sexo = normalizeSexo(item.sexo, item.codigosexo)
    const key = `${entidad}|${sexo}|${item.rangoedad}|${item.fecha}|${item.codigofondo}`
    const existing = map.get(key) ?? {
      Entidad: entidad,
      Fondo: item.codigofondo,
      FechaCorte: item.fecha,
      Sexo: sexo,
      RangoEdad: item.rangoedad,
      CantidadAfiliados: 0,
    }
    existing.CantidadAfiliados += item.afiliados ?? 0
    map.set(key, existing)
  }
  return Array.from(map.values())
}

export function transformBeneficios(raw: RawBeneficio[]): Beneficio[] {
  // La API desglosa pensiones por (sexo, rango edad, tipo beneficio, fecha).
  // Sumamos por (entidad, fecha, tipo) para obtener pensionados y montos.
  const map = new Map<string, Beneficio>()
  for (const item of raw) {
    const entidad = normalizeEntityName(item.entidad)
    const key = `${entidad}|${item.fecha}|${item.codigofondo}|${item.tipobeneficio}`
    const existing = map.get(key) ?? {
      Entidad: entidad,
      Fondo: item.codigofondo,
      FechaCorte: item.fecha,
      CantidadPensionados: 0,
      MontoBeneficios: 0,
    }
    existing.CantidadPensionados += item.beneficio ?? 0
    existing.MontoBeneficios += item.beneficiocolones ?? 0
    map.set(key, existing)
  }
  return Array.from(map.values())
}

/**
 * Beneficios (pensionados) conservando sexo y rango de edad, que
 * transformBeneficios descarta al sumar por (entidad, fecha, tipo). Agrupa por
 * (entidad, sexo, rangoedad, fecha, fondo) sumando `beneficio` (cantidad de
 * pensionados) a través de todos los `tipobeneficio`.
 *
 * Regla de nulos: si TODOS los registros de una celda vienen con `beneficio`
 * null, la celda queda `null` ("no disponible"); si solo alguno es null, se
 * suma el resto (no se inventa el faltante). Nunca se presenta un null como 0.
 */
export function transformBeneficiosDemograficos(raw: RawBeneficio[]): BeneficioDemografico[] {
  interface Acc {
    entidad: string
    fondo: string
    fecha: string
    sexo: string
    rango: string
    tipo: string
    sum: number
    allNull: boolean
  }
  const map = new Map<string, Acc>()
  for (const item of raw) {
    const entidad = normalizeEntityName(item.entidad)
    const sexo = normalizeSexo(item.sexo, item.codigosexo)
    const rango = (item.rangoedad ?? '').trim()
    const key = `${entidad}|${sexo}|${rango}|${item.fecha}|${item.codigofondo}`
    const existing = map.get(key) ?? {
      entidad,
      fondo: item.codigofondo,
      fecha: item.fecha,
      sexo,
      rango,
      tipo: item.tipobeneficio,
      sum: 0,
      allNull: true,
    }
    if (item.beneficio != null) {
      existing.sum += item.beneficio
      existing.allNull = false
    }
    map.set(key, existing)
  }
  return Array.from(map.values()).map(a => ({
    Entidad: a.entidad,
    Fondo: a.fondo,
    FechaCorte: a.fecha,
    Sexo: a.sexo,
    RangoEdad: a.rango,
    TipoBeneficio: a.tipo,
    CantidadPensionados: a.allNull ? null : a.sum,
  }))
}

/**
 * Serie de rentabilidad sin pérdida: conserva periodicidad, tipo (NOMINAL/
 * REAL) y el valor `rentabilidad` tal cual (null incluido). El simulador la
 * usa para promediar la rentabilidad histórica por OPC sin sustituir ausencias.
 */
export function transformRendimientosSerie(raw: RawRendimiento[]): RentabilidadSerie[] {
  return raw.map(item => {
    const tipo = item.tipo?.trim().toUpperCase()
    return {
      Entidad: normalizeEntityName(item.entidad),
      Fondo: item.codigofondo,
      FechaCorte: item.fecha,
      Tipo: tipo === 'REAL' ? 'REAL' : 'NOMINAL',
      Periodicidad: item.periodicidad.trim(),
      Rentabilidad: item.rentabilidad ?? null,
    }
  })
}

export function transformCuentas(raw: RawCuenta[]): Cuenta[] {
  // La API devuelve un desglose por categoría contable (ACTIVO, GASTOS,
  // INGRESOS, PASIVO, PATRIMONIO, VALOR DE LA CUOTA...) con montos en colones.
  // Mapeamos cada registro a (entidad, tipo de cuenta, fecha, monto).
  const map = new Map<string, Cuenta>()
  for (const item of raw) {
    const entidad = normalizeEntityName(item.entidad)
    const key = `${entidad}|${item.cuenta}|${item.fecha}|${item.codigofondo}`
    const existing = map.get(key) ?? {
      Entidad: entidad,
      Fondo: item.codigofondo,
      FechaCorte: item.fecha,
      CuentaTipo: item.cuenta,
      MontoColones: 0,
    }
    existing.MontoColones += item.montocolones ?? 0
    map.set(key, existing)
  }
  return Array.from(map.values())
}

export function transformLibreTransferencia(raw: RawLibreTransferencia[]): LibreTransferencia[] {
  // La API devuelve una matriz: fila por OPC origen, columnas por OPC destino,
  // tanto en cantidad ({OPC}_C) como en monto ({OPC}_M). Generamos un registro
  // plano por (origen, destino, fecha) contando transferencias y montos.
  const result: LibreTransferencia[] = []
  for (const item of raw) {
    const fecha = String(item.fecha ?? '')
    for (const dest of LT_DEST_KEYS) {
      const count = Number(item[`${dest}_C`] ?? 0)
      const monto = Number(item[`${dest}_M`] ?? 0)
      result.push({
        Entidad: `${normalizeEntityName(item.entidadorigen)} -> ${dest.replace(/_/g, ' ')}`,
        Fondo: String(item.codigofondo ?? ''),
        FechaCorte: fecha,
        CantidadTransferencias: count,
        MontoTransferido: monto,
      })
    }
  }
  return result
}

export function transformPortafolioISIN(raw: RawPortafolioISIN[]): PortafolioISIN[] {
  // La API devuelve un registro por (entidad, fecha, ISIN) con dos tipos:
  // 'EMISOR' y 'GESTOR', que representan la MISMA posición (el monto se
  // repite en ambos). Para no duplicar el total, conservamos solo 'EMISOR'.
  // Además, el campo de descripción legible es `emisor_gestor` (el emisor
  // real del título), no `isin` (código técnico).
  const seen = new Set<string>()
  const result: PortafolioISIN[] = []
  for (const item of raw) {
    if (item.tipo !== 'EMISOR') continue
    const key = `${item.entidad}|${item.fecha}|${item.isin}`
    if (seen.has(key)) continue
    seen.add(key)
    result.push({
      Entidad: normalizeEntityName(item.entidad),
      Fondo: item.codigofondo,
      FechaCorte: item.fecha,
      CodigoISIN: item.isin,
      Descripcion: item.emisor_gestor || item.isin,
      Monto: item.montocolones ?? 0,
      Porcentaje: 0,
    })
  }
  return result
}
