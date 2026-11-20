import { useMemo, useState } from 'react'
import { GLOSSARY } from '../../constants/glossary'
import { matchesQuery } from '../../utils/search'

/**
 * Vista del glosario de términos (Fase 2 — Educación). Buscador sin
 * distinción de acentos y rejilla de tarjetas con enlaces cruzados a términos
 * relacionados (navegación por ancla dentro del glosario).
 */
export function GlossaryView() {
  const [query, setQuery] = useState('')

  const filtered = useMemo(
    () => GLOSSARY.filter(t => matchesQuery(`${t.term} ${t.definition}`, query)),
    [query],
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-[#eeffff]">Glosario</h2>
        <p className="text-gray-500 dark:text-[#a6accd] mt-2">
          Términos clave del sistema de pensiones de Costa Rica, explicados en lenguaje sencillo.
        </p>
      </div>

      <label className="block">
        <span className="sr-only">Buscar término</span>
        <input
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar un término (ej. comisión, ROP, inflación)…"
          className="w-full px-4 py-2.5 text-sm bg-white dark:bg-[#25293c] dark:text-[#eeffff] border border-gray-300 dark:border-[#34324a] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#82aaff]"
        />
      </label>

      <p className="text-xs text-gray-400 dark:text-[#676e95]" role="status" aria-live="polite">
        {filtered.length} de {GLOSSARY.length} términos
      </p>

      <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(t => (
          <div
            key={t.term}
            id={`glosario-${encodeURIComponent(t.term)}`}
            className="bg-white dark:bg-[#25293c] rounded-xl border border-gray-200 dark:border-[#34324a] p-5 shadow-sm scroll-mt-24"
          >
            <dt className="text-lg font-semibold text-gray-800 dark:text-[#eeffff]">{t.term}</dt>
            <dd className="text-sm text-gray-600 dark:text-[#a6accd] mt-2 space-y-3">
              <p>{t.definition}</p>
              {t.related && t.related.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-xs text-gray-400 dark:text-[#676e95]">Relacionados:</span>
                  {t.related.map(r => (
                    <a
                      key={r}
                      href={`#glosario-${encodeURIComponent(r)}`}
                      className="text-xs px-2 py-0.5 rounded-full bg-blue-50 dark:bg-[#2b2a3e] text-blue-700 dark:text-[#82aaff] hover:underline"
                    >
                      {r}
                    </a>
                  ))}
                </div>
              )}
            </dd>
          </div>
        ))}
      </dl>

      {filtered.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-[#a6accd] py-8 text-center">
          No se encontraron términos para «{query}».
        </p>
      )}
    </div>
  )
}