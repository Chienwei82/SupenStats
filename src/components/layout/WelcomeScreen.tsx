const API_ENDPOINTS: { path: string; descripcion: string }[] = [
  { path: '/estadisticas/api/rendimiento', descripcion: 'Rendimiento nominal y real de los fondos por OPC' },
  { path: '/estadisticas/api/comision', descripcion: 'Comisiones de administración por OPC' },
  { path: '/estadisticas/api/portafolio', descripcion: 'Distribución del portafolio de inversión por tipo de instrumento' },
  { path: '/estadisticas/api/portafolioisin', descripcion: 'Portafolio detallado por código ISIN' },
  { path: '/estadisticas/api/afiliado', descripcion: 'Afiliados y aportantes, con desglose por sexo y rango de edad' },
  { path: '/estadisticas/api/beneficio', descripcion: 'Pensionados y beneficios pagados' },
  { path: '/estadisticas/api/cuenta', descripcion: 'Desglose contable del fondo (activo neto, patrimonio, etc.)' },
  { path: '/estadisticas/api/lt', descripcion: 'Libre transferencia de afiliados entre operadoras' },
]

export function WelcomeScreen() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800">Bienvenido a SUPEN Stats</h2>
        <p className="text-gray-500 mt-2">
          Selecciona un reporte en las pestañas para comenzar a explorar las estadísticas del sistema de pensiones.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
        <p className="text-sm text-blue-900 font-medium">
          Los datos de este dashboard se toman de las APIs públicas de SUPEN configuradas en la aplicación.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">APIs de datos utilizadas</h3>
        <div className="space-y-2">
          {API_ENDPOINTS.map(ep => (
            <div key={ep.path} className="flex items-start gap-2 text-sm">
              <code className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded whitespace-nowrap">{ep.path}</code>
              <span className="text-gray-600">{ep.descripcion}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-4">
          Base: <code className="text-gray-500">https://webapps.supen.fi.cr</code>
        </p>
      </div>
    </div>
  )
}