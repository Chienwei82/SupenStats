import { useState, useCallback } from 'react'

/**
 * Encapsula el patrón draft/applied usado por cada reporte: el usuario edita
 * el "draft" (lo que ve en los dropdowns) y solo al pulsar Consultar se
 * copian los valores a "applied", que es lo que dispara el refetch.
 *
 * Devuelve también setters estables para pasarlos directo a FilterBar.
 */
export function useReportFilters<T extends object>(defaults: T) {
  const [draft, setDraft] = useState<T>(defaults)
  const [applied, setApplied] = useState<T>(defaults)

  const consult = useCallback(() => {
    setApplied(draft)
  }, [draft])

  return { draft, setDraft, applied, consult } as const
}
