import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Link, useMatches } from '@tanstack/react-router'

const TABS: { id: string; to: string; label: string }[] = [
  { id: 'inicio', to: '/', label: 'Inicio' },
  { id: 'rendimiento', to: '/rendimiento', label: 'Rendimiento' },
  { id: 'rendimiento-real', to: '/rendimiento-real', label: 'Rend. Real' },
  { id: 'comisiones', to: '/comisiones', label: 'Comisiones' },
  { id: 'comision-rentabilidad', to: '/comision-rentabilidad', label: 'Comisión vs Rend.' },
  { id: 'portafolio', to: '/portafolio', label: 'Portafolio' },
  { id: 'afiliados', to: '/afiliados', label: 'Afiliados' },
  { id: 'activos', to: '/activos', label: 'Activos' },
  { id: 'beneficios', to: '/beneficios', label: 'Beneficios' },
  { id: 'cuentas', to: '/cuentas', label: 'Cuentas' },
  { id: 'transferencias', to: '/transferencias', label: 'Transferencias' },
  { id: 'traslados', to: '/traslados', label: 'Traslados' },
  { id: 'aportantes', to: '/aportantes', label: 'Aportantes' },
  { id: 'demografia', to: '/demografia', label: 'Demografia' },
  { id: 'simulador', to: '/simulador', label: 'Simulador' },
  { id: 'piramide', to: '/piramide', label: 'Pirámide' },
  { id: 'isin', to: '/isin', label: 'Instrumentos' },
]

/**
 * Menú colapsable de navegación entre reportes. Reemplaza la fila horizontal
 * de tabs (que crecía hasta forzar scroll en pantallas angostas) por un
 * trigger que muestra el reporte activo y despliega una grilla con todos los
 * reportes al hacer click. Se cierra con click fuera, Escape o al navegar.
 *
 * Accesibilidad: WAI-ARIA `menu` con `menuitem`s; el trigger expone
 * `aria-haspopup="menu"` y `aria-expanded`. Navegación por teclado: flechas
 * mueven el foco entre items, Home/End van al primero/último, Esc cierra y
 * devuelve el foco al trigger, Enter activa el link.
 */
export function ReportTabs() {
  const matches = useMatches()
  const activePath = matches.at(-1)?.pathname ?? '/'
  const activeTab = TABS.find(t => t.to === activePath) ?? TABS[0]!

  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const itemRefs = useRef<Record<string, HTMLAnchorElement | null>>({})

  // Cierra con click fuera del contenedor.
  useEffect(() => {
    if (!open) return
    const onMouseDown = (e: MouseEvent) => {
      if (!containerRef.current) return
      if (!containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
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
        const first = itemRefs.current[activeTab.id]
        first?.focus()
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
    const currentId = document.activeElement?.getAttribute('data-tab-id')
    const currentIndex = currentId ? TABS.findIndex(t => t.id === currentId) : TABS.findIndex(t => t.id === activeTab.id)
    const count = TABS.length
    let nextIndex = currentIndex
    if (e.key === 'ArrowDown') nextIndex = (currentIndex + 1 + count) % count
    else if (e.key === 'ArrowUp') nextIndex = (currentIndex - 1 + count) % count
    else if (e.key === 'Home') nextIndex = 0
    else if (e.key === 'End') nextIndex = count - 1
    itemRefs.current[TABS[nextIndex]!.id]?.focus()
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
            absolute z-20 mt-2 w-full sm:w-[28rem] max-h-[70vh] overflow-y-auto
            p-2 rounded-xl
            bg-white dark:bg-[#292d3e]
            border border-gray-200 dark:border-[#34324a]
            shadow-xl dark:shadow-2xl dark:shadow-black/50
            grid grid-cols-1 sm:grid-cols-2 gap-1
            motion-safe:animate-fade-in
          `}
        >
          {TABS.map(tab => {
            const isActive = activeTab.id === tab.id
            return (
              <Link
                key={tab.id}
                ref={el => { itemRefs.current[tab.id] = el }}
                to={tab.to}
                search={{}}
                role="menuitem"
                data-tab-id={tab.id}
                id={`tab-${tab.id}`}
                aria-controls={`panel-${tab.id}`}
                onClick={() => setOpen(false)}
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
      )}
    </div>
  )
}
