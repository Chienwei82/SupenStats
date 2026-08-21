import { useRef, type KeyboardEvent } from 'react'

export type ReportId = 'inicio' | 'rendimiento' | 'comisiones' | 'portafolio' | 'afiliados' | 'activos' | 'beneficios' | 'cuentas' | 'transferencias' | 'aportantes' | 'demografia' | 'isin'

interface ReportTabsProps {
  active: ReportId
  onChange: (id: ReportId) => void
}

const TABS: { id: ReportId; label: string }[] = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'rendimiento', label: 'Rendimiento' },
  { id: 'comisiones', label: 'Comisiones' },
  { id: 'portafolio', label: 'Portafolio' },
  { id: 'afiliados', label: 'Afiliados' },
  { id: 'activos', label: 'Activos' },
  { id: 'beneficios', label: 'Beneficios' },
  { id: 'cuentas', label: 'Cuentas' },
  { id: 'transferencias', label: 'Transferencias' },
  { id: 'aportantes', label: 'Aportantes' },
  { id: 'demografia', label: 'Demografia' },
  { id: 'isin', label: 'Instrumentos' },
]

export function ReportTabs({ active, onChange }: ReportTabsProps) {
  const tabRefs = useRef<Record<ReportId, HTMLButtonElement | null>>({} as Record<ReportId, HTMLButtonElement | null>)

  // Navegación por teclado siguiendo el patrón WAI-ARIA tabs (roving tabindex).
  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    const currentIndex = TABS.findIndex(t => t.id === active)
    const count = TABS.length

    const moveTo = (index: number) => {
      const nextIndex = (index + count) % count
      const next = TABS[nextIndex]
      tabRefs.current[next.id]?.focus()
      onChange(next.id)
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
        const isActive = active === tab.id
        return (
          <button
            key={tab.id}
            ref={el => { tabRefs.current[tab.id] = el }}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={isActive}
            aria-controls={`panel-${tab.id}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.id)}
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
          </button>
        )
      })}
    </nav>
  )
}
