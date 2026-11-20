import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { Link, useMatches } from '@tanstack/react-router'
import { matchesQuery } from '../../utils/search'

interface Tab {
  id: string
  to: string
  label: string
  /** Grupo de navegación al que pertenece. */
  group: 'Reportes' | 'Aprender'
}

const TABS: Tab[] = [
  // Reportes
  { id: 'inicio', to: '/', label: 'Inicio', group: 'Reportes' },
  { id: 'rendimiento', to: '/rendimiento', label: 'Rendimiento', group: 'Reportes' },
  { id: 'rendimiento-real', to: '/rendimiento-real', label: 'Rend. Real', group: 'Reportes' },
  { id: 'comisiones', to: '/comisiones', label: 'Comisiones', group: 'Reportes' },
  { id: 'comision-rentabilidad', to: '/comision-rentabilidad', label: 'Comisión vs Rend.', group: 'Reportes' },
  { id: 'portafolio', to: '/portafolio', label: 'Portafolio', group: 'Reportes' },
  { id: 'afiliados', to: '/afiliados', label: 'Afiliados', group: 'Reportes' },
  { id: 'activos', to: '/activos', label: 'Activos', group: 'Reportes' },
  { id: 'beneficios', to: '/beneficios', label: 'Beneficios', group: 'Reportes' },
  { id: 'cuentas', to: '/cuentas', label: 'Cuentas', group: 'Reportes' },
  { id: 'transferencias', to: '/transferencias', label: 'Transferencias', group: 'Reportes' },
  { id: 'traslados', to: '/traslados', label: 'Traslados', group: 'Reportes' },
  { id: 'aportantes', to: '/aportantes', label: 'Aportantes', group: 'Reportes' },
  { id: 'demografia', to: '/demografia', label: 'Demografia', group: 'Reportes' },
  { id: 'simulador', to: '/simulador', label: 'Simulador', group: 'Reportes' },
  { id: 'piramide', to: '/piramide', label: 'Pirámide', group: 'Reportes' },
  { id: 'isin', to: '/isin', label: 'Instrumentos', group: 'Reportes' },
  // Aprender
  { id: 'comparador', to: '/comparador', label: 'Comparador', group: 'Aprender' },
  { id: 'aprender', to: '/aprender', label: 'Aprender', group: 'Aprender' },
  { id: 'glosario', to: '/glosario', label: 'Glosario', group: 'Aprender' },
  { id: 'metodologia', to: '/metodologia', label: 'Metodología', group: 'Aprender' },
]

const GROUPS: Tab['group'][] = ['Reportes', 'Aprender']

/**
 * Menú colapsable de navegación entre reportes (Fase 1: agrupado + buscador).
 * Trigger que muestra el reporte activo y despliega una grilla con todos los
 * reportes agrupados por categoría, con un buscador que filtra sin distinguir
 * acentos. Se cierra con click fuera, Escape o al navegar.
 *
 * Accesibilidad: WAI-ARIA `menu` con `menuitem`s; navegación por teclado
 * (flechas/Home/End) sobre la lista filtrada; Esc cierra y devuelve el foco.
 */
export function ReportTabs() {
  const matches = useMatches()
  const activePath = matches.at(-1)?.pathname ?? '/'
  const activeTab = TABS.find(t => t.to === activePath) ?? TABS[0]!

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const itemRefs = useRef<Record<string, HTMLAnchorElement | null>>({})

  // Lista filtrada (plana) que respeta el buscador; base para navegación por teclado.
  const filtered = useMemo(
    () => TABS.filter(t => matchesQuery(t.label, query)),
    [query],
  )

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (!containerRef.current) return
      if (!containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  const closeAndFocusTrigger = () => {
    setOpen(false)
    requestAnimationFrame(() => triggerRef.current?.focus())
  }

  const handleTriggerKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setOpen(true)
      requestAnimationFrame(() => {
        const first = filtered[0]
        if (first) itemRefs.current[first.id]?.focus()
      })
    }
  }

  const handleMenuKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      closeAndFocusTrigger()
      return
    }
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'Home' && e.key !== 'End') {
      return
    }
    e.preventDefault()
    if (filtered.length === 0) return
    const currentId = document.activeElement?.getAttribute('data-tab-id')
    let currentIndex = currentId ? filtered.findIndex(t => t.id === currentId) : filtered.findIndex(t => t.id === activeTab.id)
    if (currentIndex < 0) currentIndex = 0
    const count = filtered.length
    let nextIndex = currentIndex
    if (e.key === 'ArrowDown') nextIndex = (currentIndex + 1) % count
    else if (e.key === 'ArrowUp') nextIndex = (currentIndex - 1 + count) % count
    else if (e.key === 'Home') nextIndex = 0
    else if (e.key === 'End') nextIndex = count - 1
    itemRefs.current[filtered[nextIndex]!.id]?.focus()
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="report-menu"
        onClick={() => setOpen(o => !o)}
        onKeyDown={handleTriggerKeyDown}
        className={`
          w-full sm:w-auto sm:min-w-[18rem] flex items-center justify-between gap-3
          px-4 py-2.5 text-sm font-medium rounded-xl
          bg-white dark:bg-[#292d3e]
          border border-gray-200 dark:border-[#34324a]
          shadow-md dark:shadow-lg dark:shadow-black/40
          transition-all
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#89ddff] focus-visible:ring-offset-1 dark:focus-visible:ring-offset-[#202331]
          ${open ? 'ring-2 ring-[#82aaff] ring-offset-1 dark:ring-offset-[#202331]' : ''}
        `}
      >
        <span className="flex items-center gap-2 min-w-0">
          <svg
            className="w-4 h-4 shrink-0 text-[#7c4dff] dark:text-[#82aaff]"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
          <span className="text-gray-500 dark:text-[#676e95] font-normal">Reporte:</span>
          <span className="truncate text-gray-900 dark:text-[#eeffff]">{activeTab.label}</span>
        </span>
        <svg
          className={`w-4 h-4 shrink-0 text-gray-500 dark:text-[#a6accd] transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div
          id="report-menu"
          role="menu"
          aria-label="Reportes"
          onKeyDown={handleMenuKeyDown}
          className={`
            absolute z-20 mt-2 w-full sm:w-[32rem] max-h-[70vh] overflow-y-auto
            p-2 rounded-xl
            bg-white dark:bg-[#292d3e]
            border border-gray-200 dark:border-[#34324a]
            shadow-xl dark:shadow-2xl dark:shadow-black/50
            motion-safe:animate-fade-in
          `}
        >
          <div className="px-2 pb-2 sticky top-0 bg-white dark:bg-[#292d3e] z-10">
            <label>
              <span className="sr-only">Buscar reporte</span>
              <input
                type="search"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Buscar reporte…"
                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-[#25293c] dark:text-[#eeffff] border border-gray-200 dark:border-[#34324a] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#82aaff]"
              />
            </label>
          </div>

          {filtered.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-gray-500 dark:text-[#676e95]">
              Sin resultados para «{query}».
            </p>
          )}

          {GROUPS.map(group => {
            const items = filtered.filter(t => t.group === group)
            if (items.length === 0) return null
            return (
              <div key={group} className="mb-1">
                <p className="px-3 pt-2 pb-1 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-[#676e95]">
                  {group}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                  {items.map(tab => {
                    const isActive = activeTab.id === tab.id
                    return (
                      <Link
                        key={tab.id}
                        ref={el => {
                          itemRefs.current[tab.id] = el
                          return () => { delete itemRefs.current[tab.id] }
                        }}
                        to={tab.to}
                        search={{}}
                        role="menuitem"
                        data-tab-id={tab.id}
                        id={`tab-${tab.id}`}
                        aria-controls={`panel-${tab.id}`}
                        aria-current={isActive ? 'page' : undefined}
                        onClick={() => { setOpen(false); setQuery('') }}
                        className={`
                          px-3 py-2 text-sm font-medium rounded-lg transition-all
                          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#89ddff] focus-visible:ring-offset-1 dark:focus-visible:ring-offset-[#292d3e]
                          ${isActive
                            ? 'bg-gradient-to-r from-[#7c4dff] to-[#82aaff] text-white shadow-md'
                            : 'text-gray-700 dark:text-[#a6accd] hover:bg-gray-100 dark:hover:bg-[#303348] hover:text-gray-900 dark:hover:text-[#eeffff]'
                          }
                        `}
                      >
                        {tab.label}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}