export function parseDate(dateStr: string): Date {
  if (!dateStr) return new Date()
  if (dateStr.includes('T')) return new Date(dateStr)
  const parts = dateStr.split(/[/\-\.]/)
  if (parts.length === 3) {
    const [a, b, c] = parts.map(Number)
    if (a > 12) return new Date(a, b - 1, c)
    if (c > 31) return new Date(c, a - 1, b)
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
  Comision, Rendimiento, Portafolio, Afiliado,
  AfiliadoAportante, AfiliadoDemografico, Beneficio, Cuenta, LibreTransferencia, PortafolioISIN,
  RawComision, RawRendimiento, RawPortafolio, RawAfiliado,
  RawBeneficio, RawCuenta, RawLibreTransferencia, RawPortafolioISIN,
} from '../types/suppen'
import { normalizeEntityName } from '../constants/suppen'

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
    Porcentaje: 0,
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
      ComisionAdministracion: 0,
      ComisionReserva: 0,
      ComisionTotal: 0,
    }
    existing.ComisionAdministracion = item['comisión'] ?? 0
    existing.ComisionTotal = item['comisión'] ?? 0
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
  const DEST_KEYS = ['POPULAR', 'VIDA_PLENA', 'BACSJ_PENSIONES', 'BCR_PENSION', 'CCSS_OPC', 'BN_VITAL', 'INS_PENSIONES', 'IBP_PENSIONES']
  for (const item of raw) {
    const fecha = String(item.fecha ?? '')
    for (const dest of DEST_KEYS) {
      const count = Number(item[`${dest}_C`] ?? 0)
      const monto = Number(item[`${dest}_M`] ?? 0)
      result.push({
        Entidad: `${normalizeEntityName(item.entidadorigen)} -> ${dest.replace(/_/g, ' ')}`,
        FechaCorte: fecha,
        CantidadTransferencias: count,
        MontoTransferido: monto,
      })
    }
  }
  return result
}

export function transformPortafolioISIN(raw: RawPortafolioISIN[]): PortafolioISIN[] {
  return raw.map(item => ({
    Entidad: normalizeEntityName(item.entidad),
    Fondo: item.codigofondo,
    FechaCorte: item.fecha,
    CodigoISIN: item.codigoisin,
    Descripcion: item.descripcion,
    Monto: item.monto ?? 0,
    Porcentaje: item.porcentaje ?? 0,
  }))
}
