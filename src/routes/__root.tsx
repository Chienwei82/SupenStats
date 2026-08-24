import { Outlet, createRootRoute, Link } from '@tanstack/react-router'
import { Header } from '../components/layout/Header'
import { ReportTabs } from '../components/layout/ReportTabs'
import { useTheme } from '../hooks/useTheme'

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: () => (
    <div className="p-8 text-center text-gray-600 dark:text-[#a6accd]">
      <p className="text-lg font-medium">Reporte no encontrado</p>
      <Link to="/" className="text-[#82aaff] hover:underline mt-2 inline-block">
        Volver al inicio
      </Link>
    </div>
  ),
})

function RootLayout() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#202331]">
      <Header theme={theme} onToggleTheme={toggleTheme} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <ReportTabs />
        <Outlet />
      </main>

      <footer className="bg-gray-800 dark:bg-[#1a1d2e] text-gray-300 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs space-y-3">
          <p className="text-gray-400 dark:text-[#a6accd]">
            Datos obtenidos de la API publica de la Superintendencia de Pensiones de Costa Rica (SUPEN)
          </p>
          <div className="border-t border-gray-700 dark:border-[#2b2a3e] pt-3">
            <p className="font-medium text-gray-300 dark:text-[#eeffff]">Proyecto recreativo con fines educativos</p>
            <p className="text-gray-500 dark:text-[#676e95] mt-1">
              Este proyecto no es oficial de la Superintendencia de Pensiones (SUPEN) ni tiene afiliacion alguna con entes gubernamentales. Es un proyecto de codigo abierto creado para practicar desarrollo web y visualizacion de datos.
            </p>
          </div>
          <a
            href="https://github.com/Chienwei82/SupenStats"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-gray-400 dark:text-[#a6accd] hover:text-white dark:hover:text-[#eeffff] transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            Codigo fuente en GitHub
          </a>
        </div>
      </footer>
    </div>
  )
}
