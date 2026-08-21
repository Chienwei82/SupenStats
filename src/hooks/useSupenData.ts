import { useState, useEffect, useCallback } from 'react'
import type { ApiState } from '../types/suppen'

export function useSupenData<T>(
  fetchFn: () => Promise<T[]>
): ApiState<T> {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [trigger, setTrigger] = useState(0)

  const refetch = useCallback(() => setTrigger(n => n + 1), [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchFn()
      .then(result => {
        if (!cancelled) setData(result)
      })
      .catch(err => {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Error desconocido al conectar con la API de SUPEN'
          setError(message)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [fetchFn, trigger])

  return { data, loading, error, refetch }
}
