export function Header() {
  return (
    <header className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-6 px-8 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">SUPEN Stats</h1>
          <p className="text-blue-200 text-sm mt-1">
            Dashboard de Estadisticas - Superintendencia de Pensiones de Costa Rica
          </p>
        </div>
        <div className="text-right text-sm text-blue-200">
          <p>Datos oficiales SUPEN</p>
          <p className="text-xs mt-1 opacity-75">webapps.supen.fi.cr</p>
        </div>
      </div>
    </header>
  )
}
