import { useRef, type KeyboardEvent } from 'react'
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
  { id: 'aportantes', to: '/aportantes', label: 'Aportantes' },
  { id: 'demografia', to: '/demografia', label: 'Demografia' },
  { id: 'isin', to: '/isin', label: 'Instrumentos' },
]

/**
 * Tabs de navegación basadas en el router: cada tab es un Link real, así el
 * estado activo se deriva de la URL y back/forward del navegador funcionan.
 * Conserva la navegación por teclado WAI-ARIA tabs (roving tabindex).
 */
export function ReportTabs() {
  const matches = useMatches()
  const activePath = matches.at(-1)?.pathname ?? '/'
  const activeId = TABS.find(t => t.to === activePath)?.id ?? 'inicio'
  const tabRefs = useRef<Record<string, HTMLAnchorElement | null>>({})

  // Navegación por teclado siguiendo el patrón WAI-ARIA tabs (roving tabindex).
  // El foco se mueve; la activación ocurre con Enter (nativo de los links).
  const handleKeyDown = (e: KeyboardEvent<HTMLAnchorElement>) => {
    const currentIndex = TABS.findIndex(t => t.id === activeId)
    const count = TABS.length

    const moveTo = (index: number) => {
      const nextIndex = (index + count) % count
      tabRefs.current[TABS[nextIndex].id]?.focus()
    }

    let handled = false
    switch (e.key) {
      case 'ArrowRight':
        moveTo(currentIndex + 1)
        handled = true
        break
      case 'ArrowLeft':
        moveTo(currentIndex - 1 + count)
        handled = true
        break
      case 'Home':
        moveTo(0)
        handled = true
        break
      case 'End':
        moveTo(count - 1)
        handled = true
        break
      default:
        break
    }

    if (handled) {
      e.preventDefault()
    }
  }

  return (
    <nav
      className="flex gap-1 p-1 bg-white dark:bg-[#292d3e] rounded-xl border border-gray-200 dark:border-[#34324a] shadow-md dark:shadow-lg dark:shadow-black/40 overflow-x-auto"
      role="tablist"
      aria-label="Reportes"
    >
      {TABS.map(tab => {
        const isActive = activeId === tab.id
        return (
          <Link
            key={tab.id}
            ref={el => { tabRefs.current[tab.id] = el }}
            to={tab.to}
            search={{}}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={isActive}
            aria-controls={`panel-${tab.id}`}
            tabIndex={isActive ? 0 : -1}
            onKeyDown={handleKeyDown}
            className={`
              px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#89ddff] focus-visible:ring-offset-1 dark:focus-visible:ring-offset-[#292d3e]
              ${isActive
                ? 'bg-gradient-to-r from-[#7c4dff] to-[#82aaff] text-white shadow-md'
                : 'text-gray-600 dark:text-[#a6accd] hover:bg-gray-100 dark:hover:bg-[#303348] hover:text-gray-900 dark:hover:text-[#eeffff]'
              }
            `}
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
