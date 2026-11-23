/**
 * Dato del día — Curiosidades financieras y del sistema de pensiones de Costa Rica.
 *
 * Se selecciona un hecho basado en el día del año (índice estable) para que
 * todos los usuarios vean el mismo dato en un día dado. No se consultan APIs
 * externas; es contenido educativo estático.
 */

export interface DailyFact {
  id: string
  title: string
  content: string
  emoji: string
  /** Ruta relacionada para profundizar (opcional). */
  relatedTo?: string
}

export const DAILY_FACTS: DailyFact[] = [
  {
    id: 'comision-compuesta',
    title: 'El poder de la comisión baja',
    content: 'Una comisión del 0.35% vs. una del 1.50% puede marcar la diferencia de millones de colones en tu pensión final gracias al interés compuesto. Cada décimo porcentual cuenta.',
    emoji: '💰',
    relatedTo: '/comisiones',
  },
  {
    id: 'rentabilidad-real',
    title: 'Nominal no es real',
    content: 'La rentabilidad nominal es lo que dice el gráfico. La rentabilidad real descuenta la inflación: eso es lo que realmente puedes comprar con tu pensión futura.',
    emoji: '📉',
    relatedTo: '/rendimiento-real',
  },
  {
    id: 'afiliado-vs-aportante',
    title: 'Afiliado ≠ Aportante',
    content: 'Estar afiliado a una operadora no significa que estés cotizando. El aportante es quien activa su cuenta con aportes regulares, usualmente mediante empleo formal.',
    emoji: '👥',
    relatedTo: '/afiliados',
  },
  {
    id: 'diversificacion',
    title: 'No pongas todos los huevos en una canasta',
    content: 'Los portafolios de pensiones están diversificados entre bonos, acciones y otros instrumentos para reducir el riesgo. Si uno baja, otros pueden compensar.',
    emoji: '🥚',
    relatedTo: '/portafolio',
  },
  {
    id: 'poder-adquisitivo',
    title: '¿Cuánto valdrán realmente esos colones?',
    content: 'Una pensión nominal de 1 millón de colones dentro de 20 años no compra lo mismo que hoy. Ajustar por inflación te muestra el equivalente en colones de hoy: tu poder adquisitivo real.',
    emoji: '🛒',
    relatedTo: '/simulador',
  },
  {
    id: 'traslados',
    title: 'Puedes cambiar de operadora',
    content: 'El sistema permite trasladar tus ahorros entre operadoras de pensiones. Compara comisiones y rentabilidad antes de decidir; el traslado tiene efectos en tu portafolio.',
    emoji: '🔄',
    relatedTo: '/traslados',
  },
  {
    id: 'beneficios',
    title: 'Más que una vejez',
    content: 'El sistema de pensiones no solo cubre vejez: también incluye invalidez, muerte y sobrevivencia, protegiéndote a ti y a tu familia en diferentes momentos de la vida.',
    emoji: '🛡️',
    relatedTo: '/beneficios',
  },
  {
    id: 'demografia',
    title: 'La pirámide se invierte',
    content: 'Costa Rica está envejeciendo: cada vez hay más adultos mayores por cada joven en edad de cotizar. Esto afecta la sostenibilidad del sistema de pensiones a largo plazo.',
    emoji: '👵',
    relatedTo: '/piramide',
  },
  {
    id: 'isina',
    title: '¿Qué es un ISIN?',
    content: 'El ISIN (International Securities Identification Number) es el código único que identifica cada instrumento financiero. Te permite saber exactamente en qué está invertido tu dinero.',
    emoji: '🔣',
    relatedTo: '/isin',
  },
  {
    id: 'activos-netos',
    title: 'Activos netos = patrimonio',
    content: 'Los activos netos son el valor total de los activos de un fondo menos sus pasivos. Es, en resumen, el patrimonio que pertenece a los afiliados de esa operadora.',
    emoji: '🏦',
    relatedTo: '/activos',
  },
]

/**
 * Selecciona el dato del día basado en la fecha actual.
 * El índice es estable para todo el día (mismo dato para todos los usuarios).
 */
export function getDailyFact(): DailyFact {
  const today = new Date()
  const startOfYear = new Date(today.getFullYear(), 0, 0)
  const diff = today.getTime() - startOfYear.getTime()
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24))
  const index = dayOfYear % DAILY_FACTS.length
  return DAILY_FACTS[index]
}