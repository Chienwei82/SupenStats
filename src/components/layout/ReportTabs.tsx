export type ReportId = 'resumen' | 'rendimiento' | 'comisiones' | 'portafolio' | 'afiliados' | 'activos'

interface ReportTabsProps {
  active: ReportId
  onChange: (id: ReportId) => void
}

const TABS: { id: ReportId; label: string }[] = [
  { id: 'resumen', label: 'Resumen' },
  { id: 'rendimiento', label: 'Rendimiento' },
  { id: 'comisiones', label: 'Comisiones' },
  { id: 'portafolio', label: 'Portafolio' },
  { id: 'afiliados', label: 'Afiliados' },
  { id: 'activos', label: 'Activos' },
]

export function ReportTabs({ active, onChange }: ReportTabsProps) {
  return (
    <nav className="flex gap-1 p-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
      {TABS.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`
            px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap
            ${active === tab.id
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }
          `}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  )
}
