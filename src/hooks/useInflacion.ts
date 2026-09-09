import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { calcularTasaInflacionPromedio } from '../utils/reportes'
import type { InflacionPromedio, RegistroIPC } from '../types/supen'

/**
 * Ruta del proxy BCCR (fase futura): Vercel Function `api/bccr-inflacion.ts`.
 * Hoy el proxy no existe; la integración se considera "no configurada" y el
 * hook degrada a sin datos (Reporte 7, Opción B aprobada).
 */
export const BCCR_INFLACION_URL = '/api/bccr-inflacion'

/**
 * true cuando el proxy BCCR está disponible. Se activa con la env
 * `VITE_BCCR_CONFIGURADO=true` en la fase futura en que se conecte BCCR;
 * no requiere tocar la lógica del reporte.
 */
const BCCR_CONFIGURADO = import.meta.env.VITE_BCCR_CONFIGURADO === 'true'

async function fetchInflacionRegistros(signal?: AbortSignal): Promise<RegistroIPC[]> {
  if (!BCCR_CONFIGURADO) return []
  const res = await fetch(BCCR_INFLACION_URL, { signal })
  if (!res.ok) throw new Error('No se pudo obtener datos de inflación del BCCR')
  const json = (await res.json()) as { registros: RegistroIPC[] }
  return json.registros
}

interface UseInflacionResult {
  /** Resultado del cálculo de inflación promedio por tramo del histórico. */
  inflacion: InflacionPromedio
  /** false = BCCR no conectado (reporte degradado); distingue del caso
   *  "conectado pero histórico insuficiente" para la UI. */
  integracionActiva: boolean
  cargando: boolean
  error: string | null
}

/**
 * Provee la tasa de inflación promedio para el cálculo de poder adquisitivo
 * del simulador. Hoy (sin BCCR) devuelve `inflacion.tasaAnual = null`; la UI
 * debe mostrar solo el monto nominal. Cuando se conecte el proxy BCCR, basta
 * con activar la env `VITE_BCCR_CONFIGURADO` — la firma y el query key quedan
 * estables para ese cambio.
 */
export function useInflacion(): UseInflacionResult {
  const query = useQuery({
    queryKey: ['inflacion-bccr'],
    queryFn: ({ signal }) => fetchInflacionRegistros(signal),
    // El IPC histórico es inmutable: se puede cachear por mucho tiempo.
    staleTime: 1000 * 60 * 60 * 24,
    placeholderData: prev => prev,
  })

  const inflacion = useMemo(
    () => calcularTasaInflacionPromedio(query.data ?? []),
    [query.data],
  )

  return {
    inflacion,
    integracionActiva: BCCR_CONFIGURADO,
    cargando: query.isFetching,
    error: query.error instanceof Error ? query.error.message : null,
  }
}