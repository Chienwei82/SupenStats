import type { Comision, Rendimiento, Portafolio, PortafolioISIN, Afiliado, AfiliadoAportante, AfiliadoDemografico, Beneficio, Cuenta, LibreTransferencia, FondoTipo, DateRange, RawComision, RawRendimiento, RawPortafolio, RawAfiliado, RawBeneficio, RawCuenta, RawLibreTransferencia, RawPortafolioISIN } from '../types/suppen'
import { transformComisiones, transformRendimientos, transformPortafolios, transformAfiliados, transformAfiliadosAportantes, transformAfiliadosDemograficos, transformBeneficios, transformCuentas, transformLibreTransferencia, transformPortafolioISIN } from '../utils/dataTransformers'

const API_BASE = '/estadisticas/api'

// Tiempo máximo de espera por petición. La API de SUPEN es muy lenta
// (portafolio puede tardar 19-40s), así que usamos un límite generoso pero
// justo que permite mostrar el error en vez de colgarse indefinidamente.
const REQUEST_TIMEOUT_MS = 90_000

function createApiError(status: number, message: string): Error & { status: number } {
  const err = new Error(message) as Error & { status: number }
  err.status = status
  err.name = 'ApiError'
  return err
}

/** Error lanzado cuando la petición excede REQUEST_TIMEOUT_MS. */
export class TimeoutError extends Error {
  constructor() {
    super(`La petición tardó más de ${Math.round(REQUEST_TIMEOUT_MS / 1000)} segundos en responder. La API de SUPEN puede estar saturada; inténtalo de nuevo.`)
    this.name = 'TimeoutError'
  }
}

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const controller = new AbortController()
  let timedOut = false
  const timeoutId = setTimeout(() => {
    timedOut = true
    controller.abort()
  }, REQUEST_TIMEOUT_MS)

  // Si el caller provee su propio signal (ej. desde useSupenData al cambiar
  // de pestaña), lo encadenamos para también abortar cuando se cancele.
  const onCallerAbort = () => controller.abort()
  signal?.addEventListener('abort', onCallerAbort, { once: true })

  try {
    const response = await fetch(url, { signal: controller.signal })
    if (!response.ok) {
      throw createApiError(response.status, `Error ${response.status}: ${response.statusText}`)
    }
    return await response.json()
  } catch (err) {
    // Distinguimos un timeout real de un abort del usuario: si abortamos por
    // timeout, lanzamos TimeoutError para que la UI pueda mostrar un mensaje;
    // los AbortError ajenos se propagan tal cual (useSupenData los ignora).
    if (timedOut) throw new TimeoutError()
    throw err
  } finally {
    clearTimeout(timeoutId)
    signal?.removeEventListener('abort', onCallerAbort)
  }
}

function buildQueryString(params: Record<string, string | undefined>): string {
  const filtered = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => [k, v as string])
  if (filtered.length === 0) return ''
  return '?' + new URLSearchParams(filtered).toString()
}

function fechaParams(range?: DateRange) {
  return {
    FechaInicio: range?.FechaInicio,
    FechaFinal: range?.FechaFinal,
  }
}

/**
 * Validación runtime mínima de la respuesta: la API debe devolver un array.
 * Sin esto, un cambio de shape en SUPEN produce errores crípticos dentro de
 * Recharts en vez de un mensaje claro al usuario.
 */
function assertArray<T>(value: unknown, endpoint: string): T[] {
  if (!Array.isArray(value)) {
    throw createApiError(502, `Respuesta inesperada de la API (${endpoint}): se esperaba una lista de datos.`)
  }
  return value as T[]
}

export async function fetchComisiones(fondo?: FondoTipo, range?: DateRange, signal?: AbortSignal): Promise<Comision[]> {
  const qs = buildQueryString({
    Fondo: fondo,
    ...fechaParams(range),
  })
  const raw = assertArray<RawComision>(await fetchJson<unknown>(`${API_BASE}/comision${qs}`, signal), 'comision')
  return transformComisiones(raw)
}

export async function fetchRendimiento(fondo?: FondoTipo, entidad?: string, range?: DateRange, signal?: AbortSignal): Promise<Rendimiento[]> {
  const qs = buildQueryString({
    Fondo: fondo,
    Entidad: entidad,
    ...fechaParams(range),
  })
  const raw = assertArray<RawRendimiento>(await fetchJson<unknown>(`${API_BASE}/rendimiento${qs}`, signal), 'rendimiento')
  return transformRendimientos(raw)
}

export async function fetchPortafolio(entidad?: string, fondo?: FondoTipo, range?: DateRange, signal?: AbortSignal): Promise<Portafolio[]> {
  const qs = buildQueryString({
    Entidad: entidad,
    Fondo: fondo,
    ...fechaParams(range),
  })
  const raw = assertArray<RawPortafolio>(await fetchJson<unknown>(`${API_BASE}/portafolio${qs}`, signal), 'portafolio')
  return transformPortafolios(raw)
}

export async function fetchPortafolioISIN(entidad?: string, fondo?: FondoTipo, range?: DateRange, signal?: AbortSignal): Promise<PortafolioISIN[]> {
  const qs = buildQueryString({
    Entidad: entidad,
    Fondo: fondo,
    ...fechaParams(range),
  })
  const raw = assertArray<RawPortafolioISIN>(await fetchJson<unknown>(`${API_BASE}/portafolioisin${qs}`, signal), 'portafolioisin')
  return transformPortafolioISIN(raw)
}

export async function fetchAfiliados(entidad?: string, fondo?: FondoTipo, range?: DateRange, signal?: AbortSignal): Promise<Afiliado[]> {
  const qs = buildQueryString({
    Entidad: entidad,
    Fondo: fondo,
    ...fechaParams(range),
  })
  const raw = assertArray<RawAfiliado>(await fetchJson<unknown>(`${API_BASE}/afiliado${qs}`, signal), 'afiliado')
  return transformAfiliados(raw)
}

export async function fetchAfiliadosAportantes(entidad?: string, fondo?: FondoTipo, range?: DateRange, signal?: AbortSignal): Promise<AfiliadoAportante[]> {
  const qs = buildQueryString({
    Entidad: entidad,
    Fondo: fondo,
    ...fechaParams(range),
  })
  const raw = assertArray<RawAfiliado>(await fetchJson<unknown>(`${API_BASE}/afiliado${qs}`, signal), 'afiliado')
  return transformAfiliadosAportantes(raw)
}

export async function fetchAfiliadosDemograficos(entidad?: string, fondo?: FondoTipo, range?: DateRange, signal?: AbortSignal): Promise<AfiliadoDemografico[]> {
  const qs = buildQueryString({
    Entidad: entidad,
    Fondo: fondo,
    ...fechaParams(range),
  })
  const raw = assertArray<RawAfiliado>(await fetchJson<unknown>(`${API_BASE}/afiliado${qs}`, signal), 'afiliado')
  return transformAfiliadosDemograficos(raw)
}

export async function fetchBeneficios(entidad?: string, fondo?: FondoTipo, range?: DateRange, signal?: AbortSignal): Promise<Beneficio[]> {
  const qs = buildQueryString({
    Entidad: entidad,
    Fondo: fondo,
    ...fechaParams(range),
  })
  const raw = assertArray<RawBeneficio>(await fetchJson<unknown>(`${API_BASE}/beneficio${qs}`, signal), 'beneficio')
  return transformBeneficios(raw)
}

export async function fetchCuentas(entidad?: string, fondo?: FondoTipo, range?: DateRange, signal?: AbortSignal): Promise<Cuenta[]> {
  const qs = buildQueryString({
    Entidad: entidad,
    Fondo: fondo,
    ...fechaParams(range),
  })
  const raw = assertArray<RawCuenta>(await fetchJson<unknown>(`${API_BASE}/cuenta${qs}`, signal), 'cuenta')
  return transformCuentas(raw)
}

export async function fetchLibreTransferencia(fondo?: FondoTipo, range?: DateRange, signal?: AbortSignal): Promise<LibreTransferencia[]> {
  const qs = buildQueryString({
    // Nota: /lt ignora Entidad (verificado contra la API real); Fondo y fechas sí filtran.
    Fondo: fondo,
    ...fechaParams(range),
  })
  const raw = assertArray<RawLibreTransferencia>(await fetchJson<unknown>(`${API_BASE}/lt${qs}`, signal), 'lt')
  return transformLibreTransferencia(raw)
}
