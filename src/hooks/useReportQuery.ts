import { useCallback, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'
import type { FondoTipo, DateRange } from '../types/supen'

/**
 * Search params de filtros compartidos por todas las rutas de reportes.
 * Validados con zod en el `validateSearch` de cada ruta.
 */
export interface ReportSearch {
  fondo?: FondoTipo | ''
  fechaInicio?: string
  fechaFinal?: string
}

export function filtersToSearch(applied: { fondo: FondoTipo | ''; dates?: DateRange }): ReportSearch {
  return {
    fondo: applied.fondo || undefined,
    fechaInicio: applied.dates?.FechaInicio,
    fechaFinal: applied.dates?.FechaFinal,
  }
}

/**
 * Reemplaza a useSupenData: un useQuery por reporte. La cancelación es
 * nativa (los fetchers ya aceptan AbortSignal) y la caché evita refetch
 * al volver a una pestaña visitada (staleTime 10min configurado globalmente).
 */
export function useReportQuery<T>(
  key: readonly unknown[],
  fetchFn: (signal?: AbortSignal) => Promise<T[]>,
) {
  const query = useQuery({
    queryKey: key,
    queryFn: ({ signal }) => fetchFn(signal),
    // La API de SUPEN no soporta bien reintentos concurrentes en endpoints
    // pesados; con retry:1 global basta.
    placeholderData: prev => prev,
  })

  return {
    data: query.data ?? [],
    // Usamos isFetching (no isPending): con placeholderData los datos previos
    // se conservan al cambiar de filtros, lo que pone el status en 'success'
    // y hace que isPending sea false aunque se esté descargando. isFetching
    // es true tanto en la primera carga como en los refetch con datos previos,
    // así ReportView puede mostrar skeleton (sin datos) u overlay (con datos).
    loading: query.isFetching,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: () => query.refetch(),
  }
}

/**
 * Patrón draft/applied sobre search params de la URL: el draft vive en
 * memoria (lo que ve FilterBar) y consult() navega escribiendo los valores
 * aplicados en la URL, lo que cambia la queryKey y dispara el refetch.
 * Ventaja: URLs compartibles y back/forward del navegador funcionan.
 */
export function useUrlFilters(defaults: { fondo: FondoTipo | ''; dates?: DateRange }) {
  const navigate = useNavigate()
  const [draft, setDraft] = useState(defaults)

  const consult = useCallback(() => {
    void navigate({
      to: '.',
      search: (prev: Record<string, unknown>) => ({ ...prev, ...filtersToSearch(draft) }),
      replace: false,
    })
  }, [draft, navigate])

  return { draft, setDraft, consult } as const
}

/**
 * Search param suelto con default: lectura validada + escritura vía navigate.
 * Usado por los selectores de los gráficos (periodicidad, corte, métrica) para
 * que la vista completa quede reflejada en la URL (compartible/back-navegable).
 */
export function useUrlParam<K extends string>(
  key: K,
  isValid: (v: string | undefined) => boolean,
  fallback: string,
): [string, (v: string) => void] {
  const search = useSearch({ strict: false }) as Record<string, unknown>
  const navigate = useNavigate()
  const raw = search[key]
  const value = typeof raw === 'string' && isValid(raw) ? raw : fallback
  const setValue = useCallback(
    (v: string) => {
      void navigate({
        to: '.',
        search: (prev: Record<string, unknown>) => ({ ...prev, [key]: v }),
        replace: false,
      })
    },
    [key, navigate],
  )
  return [value, setValue]
}

