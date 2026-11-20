import { Link } from '@tanstack/react-router'

interface ReportCard {
  to: string
  title: string
  description: string
}

const REPORT_GROUPS: { title: string; cards: ReportCard[] }[] = [
  {
    title: 'Rendimiento y costos',
    cards: [
      { to: '/rendimiento', title: 'Rendimiento', description: 'Rentabilidad histórica por operadora.' },
      { to: '/rendimiento-real', title: 'Rentabilidad real', description: 'Nominal vs. real, ajustada por inflación.' },
      { to: '/comisiones', title: 'Comisiones', description: 'Cuánto cobra cada operadora por administrar.' },
      { to: '/comision-rentabilidad', title: 'Comisión vs. rendimiento', description: 'Balance entre lo que cobran y lo que rinden.' },
    ],
  },
  {
    title: 'Inversiones y cuentas',
    cards: [
      { to: '/portafolio', title: 'Portafolio', description: 'Distribución de las inversiones por instrumento.' },
      { to: '/isin', title: 'Instrumentos (ISIN)', description: 'Detalle de los títulos por código ISIN.' },
      { to: '/activos', title: 'Activos netos', description: 'Patrimonio de los fondos por operadora.' },
      { to: '/cuentas', title: 'Cuentas', description: 'Desglose contable del fondo.' },
    ],
  },
  {
    title: 'Personas y demografía',
    cards: [
      { to: '/afiliados', title: 'Afiliados', description: 'Afiliados y aportantes por operadora.' },
      { to: '/aportantes', title: 'Aportantes', description: 'Afiliados vs. aportantes activos.' },
      { to: '/beneficios', title: 'Beneficios', description: 'Pensionados y beneficios pagados.' },
      { to: '/demografia', title: 'Demografía', description: 'Distribución por sexo y edad.' },
      { to: '/piramide', title: 'Pirámide poblacional', description: 'Estructura por edad y sexo.' },
    ],
  },
  {
    title: 'Movilidad y proyección',
    cards: [
      { to: '/transferencias', title: 'Transferencias', description: 'Montos y personas transferidas.' },
      { to: '/traslados', title: 'Traslados', description: 'Flujos y balance entre operadoras.' },
      { to: '/simulador', title: 'Simulador de pensión', description: 'Proyecta tu ahorro y poder adquisitivo.' },
    ],
  },
]

const LEARN_CARDS: ReportCard[] = [
  { to: '/comparador', title: 'Comparador', description: 'Compara dos operadoras en el tiempo.' },
  { to: '/aprender', title: 'Aprender', description: 'Rutas guiadas y quiz interactivo.' },
  { to: '/glosario', title: 'Glosario', description: 'Términos clave explicados.' },
  { to: '/metodologia', title: 'Metodología', description: 'De dónde salen y cómo se tratan los datos.' },
]

const cardClass =
  'block bg-white dark:bg-[#25293c] rounded-xl border border-gray-200 dark:border-[#34324a] p-4 shadow-sm hover:shadow-md hover:border-[#82aaff] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#82aaff]'

/**
 * Nueva Home (Fase 1): aterrizaje agrupado por categorías temáticas con tarjetas
 * que enlazan a cada reporte y a los recursos de aprendizaje. Reemplaza la lista
 * plana de endpoints por una navegación orientada a tareas.
 */
export function WelcomeScreen() {
  return (
    <div className="space-y-10">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-[#eeffff]">Bienvenido a SUPEN Stats</h2>
        <p className="text-gray-500 dark:text-[#a6accd] mt-2 max-w-2xl mx-auto">
          Explora las estadísticas oficiales del sistema de pensiones de Costa Rica. Elige una categoría para empezar.
        </p>
      </div>

      {REPORT_GROUPS.map(group => (
        <section key={group.title} className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-[#c7cbe0]">{group.title}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {group.cards.map(card => (
              <Link key={card.to} to={card.to} search={{}} className={cardClass}>
                <p className="font-semibold text-gray-800 dark:text-[#eeffff]">{card.title}</p>
                <p className="text-sm text-gray-500 dark:text-[#a6accd] mt-1">{card.description}</p>
              </Link>
            ))}
          </div>
        </section>
      ))}

      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-[#c7cbe0]">Aprender</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {LEARN_CARDS.map(card => (
            <Link key={card.to} to={card.to} search={{}} className={cardClass}>
              <p className="font-semibold text-gray-800 dark:text-[#eeffff]">{card.title}</p>
              <p className="text-sm text-gray-500 dark:text-[#a6accd] mt-1">{card.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <div className="bg-blue-50 dark:bg-[#292d3e] border border-blue-200 dark:border-[#2b2a3e] rounded-xl p-5">
        <p className="text-sm text-blue-900 dark:text-[#89ddff]">
          Los datos se toman de la API pública de la Superintendencia de Pensiones (SUPEN). Este es un proyecto
          educativo y no está afiliado a entes gubernamentales. Los valores ausentes se muestran como «no disponible»,
          nunca como cero.
        </p>
      </div>
    </div>
  )
}