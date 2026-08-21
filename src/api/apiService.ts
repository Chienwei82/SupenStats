import type { Comision, Rendimiento, Portafolio, PortafolioISIN, Afiliado, AfiliadoAportante, AfiliadoDemografico, Beneficio, Cuenta, LibreTransferencia, FondoTipo, DateRange, RawComision, RawRendimiento, RawPortafolio, RawAfiliado, RawBeneficio, RawCuenta, RawLibreTransferencia, RawPortafolioISIN } from '../types/suppen'
import { transformComisiones, transformRendimientos, transformPortafolios, transformAfiliados, transformAfiliadosAportantes, transformAfiliadosDemograficos, transformBeneficios, transformCuentas, transformLibreTransferencia, transformPortafolioISIN } from '../utils/dataTransformers'

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

export async function fetchPortafolioISIN(entidad?: string, fondo?: FondoTipo, range?: DateRange): Promise<PortafolioISIN[]> {
  const qs = buildQueryString({
    Entidad: entidad,
    Fondo: fondo,
    ...fechaParams(range),
  })
  const raw = await fetchJson<RawPortafolioISIN[]>(`${API_BASE}/portafolioisin${qs}`)
  return transformPortafolioISIN(raw)
}

export async function fetchAfiliados(entidad?: string, fondo?: FondoTipo, range?: DateRange): Promise<Afiliado[]> {
  const qs = buildQueryString({
    Entidad: entidad,
    Fondo: fondo,
    ...fechaParams(range),
  })
  const raw = await fetchJson<RawAfiliado[]>(`${API_BASE}/afiliado${qs}`)
  return transformAfiliados(raw)
}

export async function fetchAfiliadosAportantes(entidad?: string, fondo?: FondoTipo, range?: DateRange): Promise<AfiliadoAportante[]> {
  const qs = buildQueryString({
    Entidad: entidad,
    Fondo: fondo,
    ...fechaParams(range),
  })
  const raw = await fetchJson<RawAfiliado[]>(`${API_BASE}/afiliado${qs}`)
  return transformAfiliadosAportantes(raw)
}

export async function fetchAfiliadosDemograficos(entidad?: string, fondo?: FondoTipo, range?: DateRange): Promise<AfiliadoDemografico[]> {
  const qs = buildQueryString({
    Entidad: entidad,
    Fondo: fondo,
    ...fechaParams(range),
  })
  const raw = await fetchJson<RawAfiliado[]>(`${API_BASE}/afiliado${qs}`)
  return transformAfiliadosDemograficos(raw)
}

export async function fetchBeneficios(entidad?: string, fondo?: FondoTipo, range?: DateRange): Promise<Beneficio[]> {
  const qs = buildQueryString({
    Entidad: entidad,
    Fondo: fondo,
    ...fechaParams(range),
  })
  const raw = await fetchJson<RawBeneficio[]>(`${API_BASE}/beneficio${qs}`)
  return transformBeneficios(raw)
}

export async function fetchCuentas(entidad?: string, fondo?: FondoTipo, range?: DateRange): Promise<Cuenta[]> {
  const qs = buildQueryString({
    Entidad: entidad,
    Fondo: fondo,
    ...fechaParams(range),
  })
  const raw = await fetchJson<RawCuenta[]>(`${API_BASE}/cuenta${qs}`)
  return transformCuentas(raw)
}

export async function fetchLibreTransferencia(entidad?: string, range?: DateRange): Promise<LibreTransferencia[]> {
  const qs = buildQueryString({
    Entidad: entidad,
    ...fechaParams(range),
  })
  const raw = await fetchJson<RawLibreTransferencia[]>(`${API_BASE}/lt${qs}`)
  return transformLibreTransferencia(raw)
}
