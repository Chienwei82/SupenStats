import { useEffect, useRef, useState } from 'react'

/**
 * Botón para copiar la URL actual (incluye fondo, fechas y selectores) al
 * portapapeles. Permite compartir la vista exacta de un reporte.
 *
 * Usa `navigator.clipboard` cuando está disponible y cae a un textarea
 * temporal con `document.execCommand('copy')` en contextos no seguros.
 * El feedback "Copiado" se anuncia con `aria-live="polite"`.
 */
export function ShareButton() {
  const [copiado, setCopiado] = useState(false)
  const timerRef = useRef<number | null>(null)

  useEffect(() => () => {
    if (timerRef.current != null) window.clearTimeout(timerRef.current)
  }, [])

  const fallbackCopy = (text: string): boolean => {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(textarea)
    return ok
  }

  const onCopy = async () => {
    const url = window.location.href
    let ok = false
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url)
        ok = true
      } else {
        ok = fallbackCopy(url)
      }
    } catch {
      ok = fallbackCopy(url)
    }
    if (!ok) return

    setCopiado(true)
    if (timerRef.current != null) window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={copiado ? 'Enlace copiado al portapapeles' : 'Copiar enlace de esta vista'}
      title="Copiar enlace de esta vista"
      className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 dark:border-[#34324a] bg-white dark:bg-[#25293c] text-gray-700 dark:text-[#a6accd] hover:bg-gray-100 dark:hover:bg-[#303348] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#82aaff] focus-visible:ring-offset-1 dark:focus-visible:ring-offset-[#202331]"
    >
      {copiado ? (
        <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      )}
      <span aria-live="polite">{copiado ? 'Copiado' : 'Copiar enlace'}</span>
    </button>
  )
}