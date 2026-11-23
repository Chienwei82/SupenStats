import { useMemo, useState, useEffect, useCallback } from 'react'
import { GLOSSARY } from '../../constants/glossary'
import { matchesQuery } from '../../utils/search'
import { useBadges } from '../../hooks/useBadges'

/**
 * Vista del glosario de términos (Fase 2 — Educación). Buscador sin
 * distinción de acentos y rejilla de tarjetas con enlaces cruzados a términos
 * relacionados (navegación por ancla dentro del glosario).
 */
export function GlossaryView() {
  const [query, setQuery] = useState('')
  const [modoEstudio, setModoEstudio] = useState(false)
  const [indiceTarjeta, setIndiceTarjeta] = useState(0)
  const [tarjetaVolteada, setTarjetaVolteada] = useState(false)
  const { visitGlossary, studyFlashcard } = useBadges()

  // Registrar visita al glosario para insignias (una vez por montaje).
  useEffect(() => {
    visitGlossary()
  }, [visitGlossary])

  const filtered = useMemo(
    () => GLOSSARY.filter(t => matchesQuery(`${t.term} ${t.definition}`, query)),
    [query],
  )

  // Reiniciar índice cuando cambie el filtrado o se salga del modo estudio.
  useEffect(() => {
    setIndiceTarjeta(0)
    setTarjetaVolteada(false)
  }, [filtered.length, modoEstudio])

  const tarjetaActual = filtered[indiceTarjeta]

  const avancarTarjeta = useCallback(() => {
    setIndiceTarjeta(prev =>
      prev >= filtered.length - 1 ? 0 : prev + 1,
    )
    setTarjetaVolteada(false)
  }, [filtered.length])

  const retrocederTarjeta = useCallback(() => {
    setIndiceTarjeta(prev =>
      prev <= 0 ? filtered.length - 1 : prev - 1,
    )
    setTarjetaVolteada(false)
  }, [filtered.length])

  const registrarEstudio = useCallback(() => {
    studyFlashcard()
  }, [studyFlashcard])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-[#eeffff]">Glosario</h2>
          <p className="text-gray-500 dark:text-[#a6accd] mt-2">
            Términos clave del sistema de pensiones de Costa Rica, explicados en lenguaje sencillo.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setModoEstudio(prev => !prev)
            if (!modoEstudio) registrarEstudio()
          }}
          className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors
            ${modoEstudio
              ? 'bg-gray-100 dark:bg-[#34324a] border-gray-300 dark:border-[#414868] text-gray-800 dark:text-[#eeffff]'
              : 'bg-[#7c4dff] text-white border-[#7c4dff] hover:bg-[#6a3dd9]'}
          `}
          aria-pressed={modoEstudio}
        >
          {modoEstudio ? 'Vista normal' : 'Modo estudio 🃏'}
        </button>
      </div>

      {modoEstudio && filtered.length > 0 && (
        <div className="bg-white dark:bg-[#25293c] rounded-xl border border-gray-200 dark:border-[#34324a] p-6 shadow-sm text-center">
          <p className="text-xs text-gray-500 dark:text-[#a6accd] mb-1 uppercase tracking-wider font-semibold">
            Tarjeta {indiceTarjeta + 1} de {filtered.length}
          </p>
          <div
            className="relative inline-block cursor-pointer select-none group"
            onClick={() => setTarjetaVolteada(prev => !prev)}
            role="button"
            tabIndex={0}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setTarjetaVolteada(prev => !prev)
              }
            }}
            aria-label={tarjetaVolteada ? 'Mostrar término' : 'Mostrar definición'}
          >
            <div className="perspective-1000">
              <div
                className={`relative rounded-2xl border p-8 min-w-[280px] text-gray-800 dark:text-[#eeffff]
                  ${tarjetaVolteada ? 'bg-blue-50 dark:bg-[#1e293b] border-blue-200 dark:border-blue-500' : 'bg-white dark:bg-[#25293c] border-gray-200 dark:border-[#34324a]'}
                  transition-transform duration-500 ease-in-out transform-style-preserve-3d backface-visibility-hidden`}
                style={{ transform: tarjetaVolteada ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
              >
                <div className="absolute inset-0 rounded-2xl p-8 backface-visibility-hidden bg-white dark:bg-[#25293c] border-gray-200 dark:border-[#34324a] text-gray-800 dark:text-[#eeffff]" style={{ transform: 'rotateY(0deg)' }}>
                  <p className="text-xs text-gray-500 dark:text-[#a6accd] mb-2 uppercase tracking-wider font-semibold">Término</p>
                  <h3 className="text-2xl font-bold">{tarjetaActual?.term ?? ''}</h3>
                </div>
                <div className="absolute inset-0 rounded-2xl p-8 backface-visibility-hidden bg-blue-50 dark:bg-[#1e293b] border-blue-200 dark:border-blue-500 text-blue-900 dark:text-[#89ddff]" style={{ transform: 'rotateY(180deg)' }}>
                  <p className="text-xs text-blue-700 dark:text-blue-400 mb-2 uppercase tracking-wider font-semibold">Definición</p>
                  <p className="text-lg">{tarjetaActual?.definition ?? ''}</p>
                  {tarjetaActual?.related && tarjetaActual.related.length > 0 && (
                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                      <span className="text-xs text-blue-600 dark:text-blue-400">Relacionados:</span>
                      {tarjetaActual.related.map(r => (
                        <span key={r} className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                          {r}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500 dark:text-[#a6accd]">
            {tarjetaVolteada ? 'Haz clic para volver al término' : 'Haz clic para ver la definición'}
          </p>
          <div className="mt-6 flex items-center justify-between px-4">
            <button type="button" onClick={retrocederTarjeta} disabled={filtered.length <= 1} className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-[#34324a] bg-white dark:bg-[#25293c] text-gray-700 dark:text-[#eeffff] hover:bg-gray-50 dark:hover:bg-[#303348] disabled:opacity-50 disabled:cursor-not-allowed">
              Anterior
            </button>
            <button type="button" onClick={avancarTarjeta} disabled={filtered.length <= 1} className="px-3 py-1.5 text-sm rounded-lg border border-[#7c4dff] bg-[#7c4dff] text-white hover:bg-[#6a3dd9] disabled:opacity-50 disabled:cursor-not-allowed">
              Siguiente
            </button>
          </div>
          <p className="mt-3 text-xs text-gray-400 dark:text-[#676e95]">
            {tarjetaActual ? 'Progreso: ' + (indiceTarjeta + 1) + ' / ' + filtered.length : ''}
          </p>
        </div>
      )}
      <div hidden={modoEstudio}>
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

      <p hidden={filtered.length > 0} className="text-sm text-gray-500 dark:text-[#a6accd] py-8 text-center">
          No se encontraron términos para «{query}».
        </p>
      </div>
    </div>
  )
}