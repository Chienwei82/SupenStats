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

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

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

export async function fetchComisiones(fondo?: FondoTipo, range?: DateRange, signal?: AbortSignal): Promise<Comision[]> {
  const qs = buildQueryString({
    Fondo: fondo,
    ...fechaParams(range),
  })
  const raw = await fetchJson<RawComision[]>(`${API_BASE}/comision${qs}`, signal)
  return transformComisiones(raw)
}

export async function fetchRendimiento(fondo?: FondoTipo, entidad?: string, range?: DateRange, signal?: AbortSignal): Promise<Rendimiento[]> {
  const qs = buildQueryString({
    Fondo: fondo,
    Entidad: entidad,
    ...fechaParams(range),
  })
  const raw = await fetchJson<RawRendimiento[]>(`${API_BASE}/rendimiento${qs}`, signal)
  return transformRendimientos(raw)
}

export async function fetchPortafolio(entidad?: string, fondo?: FondoTipo, range?: DateRange, signal?: AbortSignal): Promise<Portafolio[]> {
  const qs = buildQueryString({
    Entidad: entidad,
    Fondo: fondo,
    ...fechaParams(range),
  })
  const raw = await fetchJson<RawPortafolio[]>(`${API_BASE}/portafolio${qs}`, signal)
  return transformPortafolios(raw)
}

export async function fetchPortafolioISIN(entidad?: string, fondo?: FondoTipo, range?: DateRange, signal?: AbortSignal): Promise<PortafolioISIN[]> {
  const qs = buildQueryString({
    Entidad: entidad,
    Fondo: fondo,
    ...fechaParams(range),
  })
  const raw = await fetchJson<RawPortafolioISIN[]>(`${API_BASE}/portafolioisin${qs}`, signal)
  return transformPortafolioISIN(raw)
}

export async function fetchAfiliados(entidad?: string, fondo?: FondoTipo, range?: DateRange, signal?: AbortSignal): Promise<Afiliado[]> {
  const qs = buildQueryString({
    Entidad: entidad,
    Fondo: fondo,
    ...fechaParams(range),
  })
  const raw = await fetchJson<RawAfiliado[]>(`${API_BASE}/afiliado${qs}`, signal)
  return transformAfiliados(raw)
}

export async function fetchAfiliadosAportantes(entidad?: string, fondo?: FondoTipo, range?: DateRange, signal?: AbortSignal): Promise<AfiliadoAportante[]> {
  const qs = buildQueryString({
    Entidad: entidad,
    Fondo: fondo,
    ...fechaParams(range),
  })
  const raw = await fetchJson<RawAfiliado[]>(`${API_BASE}/afiliado${qs}`, signal)
  return transformAfiliadosAportantes(raw)
}

export async function fetchAfiliadosDemograficos(entidad?: string, fondo?: FondoTipo, range?: DateRange, signal?: AbortSignal): Promise<AfiliadoDemografico[]> {
  const qs = buildQueryString({
    Entidad: entidad,
    Fondo: fondo,
    ...fechaParams(range),
  })
  const raw = await fetchJson<RawAfiliado[]>(`${API_BASE}/afiliado${qs}`, signal)
  return transformAfiliadosDemograficos(raw)
}

export async function fetchBeneficios(entidad?: string, fondo?: FondoTipo, range?: DateRange, signal?: AbortSignal): Promise<Beneficio[]> {
  const qs = buildQueryString({
    Entidad: entidad,
    Fondo: fondo,
    ...fechaParams(range),
  })
  const raw = await fetchJson<RawBeneficio[]>(`${API_BASE}/beneficio${qs}`, signal)
  return transformBeneficios(raw)
}

export async function fetchCuentas(entidad?: string, fondo?: FondoTipo, range?: DateRange, signal?: AbortSignal): Promise<Cuenta[]> {
  const qs = buildQueryString({
    Entidad: entidad,
    Fondo: fondo,
    ...fechaParams(range),
  })
  const raw = await fetchJson<RawCuenta[]>(`${API_BASE}/cuenta${qs}`, signal)
  return transformCuentas(raw)
}

export async function fetchLibreTransferencia(entidad?: string, range?: DateRange, signal?: AbortSignal): Promise<LibreTransferencia[]> {
  const qs = buildQueryString({
    Entidad: entidad,
    ...fechaParams(range),
  })
  const raw = await fetchJson<RawLibreTransferencia[]>(`${API_BASE}/lt${qs}`, signal)
  return transformLibreTransferencia(raw)
}
