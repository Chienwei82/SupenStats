import type { Comision, Rendimiento, Portafolio, PortafolioISIN, Afiliado, Beneficio, Cuenta, LibreTransferencia, FondoTipo, DateRange, RawComision, RawRendimiento, RawPortafolio, RawAfiliado } from '../types/suppen'
import { transformComisiones, transformRendimientos, transformPortafolios, transformAfiliados } from '../utils/dataTransformers'

const API_BASE = '/estadisticas/api'

function createApiError(status: number, message: string): Error & { status: number } {
  const err = new Error(message) as Error & { status: number }
  err.status = status
  err.name = 'ApiError'
  return err
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url)
  if (!response.ok) {
    throw createApiError(response.status, `Error ${response.status}: ${response.statusText}`)
  }
  return response.json()
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

export async function fetchComisiones(fondo?: FondoTipo, range?: DateRange): Promise<Comision[]> {
  const qs = buildQueryString({
    Fondo: fondo,
    ...fechaParams(range),
  })
  const raw = await fetchJson<RawComision[]>(`${API_BASE}/comision${qs}`)
  return transformComisiones(raw)
}

export async function fetchRendimiento(fondo?: FondoTipo, entidad?: string, range?: DateRange): Promise<Rendimiento[]> {
  const qs = buildQueryString({
    Fondo: fondo,
    Entidad: entidad,
    ...fechaParams(range),
  })
  const raw = await fetchJson<RawRendimiento[]>(`${API_BASE}/rendimiento${qs}`)
  return transformRendimientos(raw)
}

export async function fetchPortafolio(entidad?: string, fondo?: FondoTipo, range?: DateRange): Promise<Portafolio[]> {
  const qs = buildQueryString({
    Entidad: entidad,
    Fondo: fondo,
    ...fechaParams(range),
  })
  const raw = await fetchJson<RawPortafolio[]>(`${API_BASE}/portafolio${qs}`)
  return transformPortafolios(raw)
}

export async function fetchPortafolioISIN(entidad?: string, fondo?: FondoTipo): Promise<PortafolioISIN[]> {
  const qs = buildQueryString({ Entidad: entidad, Fondo: fondo })
  return fetchJson<PortafolioISIN[]>(`${API_BASE}/portafolioisin${qs}`)
}

export async function fetchAfiliados(entidad?: string, fondo?: FondoTipo): Promise<Afiliado[]> {
  const qs = buildQueryString({ Entidad: entidad, Fondo: fondo })
  const raw = await fetchJson<RawAfiliado[]>(`${API_BASE}/afiliado${qs}`)
  return transformAfiliados(raw)
}

export async function fetchBeneficios(entidad?: string, fondo?: FondoTipo): Promise<Beneficio[]> {
  const qs = buildQueryString({ Entidad: entidad, Fondo: fondo })
  return fetchJson<Beneficio[]>(`${API_BASE}/beneficio${qs}`)
}

export async function fetchCuentas(entidad?: string, fondo?: FondoTipo): Promise<Cuenta[]> {
  const qs = buildQueryString({ Entidad: entidad, Fondo: fondo })
  return fetchJson<Cuenta[]>(`${API_BASE}/cuenta${qs}`)
}

export async function fetchLibreTransferencia(entidad?: string, range?: DateRange): Promise<LibreTransferencia[]> {
  const qs = buildQueryString({
    Entidad: entidad,
    ...fechaParams(range),
  })
  return fetchJson<LibreTransferencia[]>(`${API_BASE}/lt${qs}`)
}
