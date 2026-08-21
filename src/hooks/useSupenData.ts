import { useState, useEffect, useCallback } from 'react'
import type { ApiState } from '../types/suppen'

export function useSupenData<T>(
  fetchFn: (signal?: AbortSignal) => Promise<T[]>,
  enabled = true
): ApiState<T> {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState<string | null>(null)
  const [trigger, setTrigger] = useState(0)

  const refetch = useCallback(() => setTrigger(n => n + 1), [])

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    const controller = new AbortController()
    setLoading(true)
    setError(null)

    fetchFn(controller.signal)
      .then(result => {
        if (!cancelled) setData(result)
      })
      .catch(err => {
        if (cancelled) return
        if (err instanceof DOMException && err.name === 'AbortError') return
        const message = err instanceof Error ? err.message : 'Error desconocido al conectar con la API de SUPEN'
        setError(message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
      // Cancela la petición de red en curso (fetch) si el usuario cambia de
      // pestaña o el fetchFn deja de estar activo.
      controller.abort()
    }
  }, [fetchFn, trigger, enabled])

  return { data, loading, error, refetch }
}