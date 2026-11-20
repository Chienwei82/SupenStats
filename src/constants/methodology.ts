/**
 * Contenido de metodología (Fase 2 — Educación): explica de dónde salen los
 * datos, cómo se transforman y qué límites tiene el dashboard. Transparencia
 * metodológica para que la ciudadanía confíe e interprete bien las cifras.
 */

export interface MethodologySection {
  id: string
  title: string
  body: string
  /** Puntos clave opcionales. */
  bullets?: string[]
}

export const METHODOLOGY: MethodologySection[] = [
  {
    id: 'fuente',
    title: 'Fuente de los datos',
    body:
      'Todas las cifras provienen de la API pública de estadísticas de la Superintendencia de Pensiones (SUPEN). Este proyecto no genera ni modifica datos: los presenta tal como los publica la fuente oficial.',
    bullets: [
      'Endpoints: rendimiento, comisión, portafolio, portafolioisin, afiliado, beneficio, cuenta y lt (libre transferencia).',
      'Frecuencia: depende de cada endpoint; algunos cortes se publican con rezago.',
      'SUPEN Stats no es un sitio oficial ni está afiliado a entes gubernamentales.',
    ],
  },
  {
    id: 'nulos',
    title: 'Datos ausentes (null) ≠ cero',
    body:
      'Cuando la fuente no reporta un valor, se muestra como "no disponible" (N/D). Nunca se sustituye una ausencia por cero, porque un cero inventado distorsionaría los totales y las comparaciones.',
    bullets: [
      'Las agregaciones excluyen posiciones sin dato en lugar de sumar ceros.',
      'En las tablas, los valores ausentes se ordenan siempre al final.',
    ],
  },
  {
    id: 'rentabilidad',
    title: 'Rentabilidad nominal y real',
    body:
      'La rentabilidad nominal es la que publica la operadora sin ajuste. La rentabilidad real descuenta el efecto de la inflación y refleja el cambio en el poder adquisitivo. Ambas se muestran por separado para no confundir magnitudes.',
  },
  {
    id: 'poder-adquisitivo',
    title: 'Poder adquisitivo del simulador',
    body:
      'El simulador proyecta el ahorro usando la rentabilidad histórica promedio de la operadora elegida. Cuando hay una tasa de inflación promedio disponible, descuenta el monto nominal a colones de hoy. Si no hay inflación disponible, muestra solo el monto nominal y lo advierte explícitamente.',
    bullets: [
      'La proyección es ilustrativa y no constituye asesoría financiera.',
      'La rentabilidad pasada no garantiza resultados futuros.',
    ],
  },
  {
    id: 'traslados',
    title: 'Traslados y libre transferencia',
    body:
      'El reporte de traslados distingue entre movimientos ENTRE operadoras (libre transferencia, dato oficial de /lt) y la variación neta de afiliados (estimado derivado que mezcla traslados, altas y bajas del sistema). Se etiquetan por separado para no atribuir a los traslados algo que no son.',
  },
  {
    id: 'limitaciones',
    title: 'Limitaciones conocidas',
    body:
      'La API de SUPEN es lenta y algunos endpoints devuelven grandes volúmenes. El detalle por ISIN está congelado desde su última publicación. El dashboard cachea y limita rangos de fechas para mantener la experiencia ágil, lo que puede excluir histórico muy antiguo.',
  },
]

/** Referencias oficiales y complementarias. */
export const METHODOLOGY_REFERENCES = [
  { label: 'SUPEN — Estadísticas del sistema de pensiones', url: 'https://www.supen.fi.cr/estadisticas' },
  { label: 'SUPEN — Manual de uso del API', url: 'https://www.supen.fi.cr/documents/20121/107570/GuiaAPISUPEN.pdf' },
  { label: 'BCCR — Índice de Precios al Consumidor (IPC)', url: 'https://www.bccr.fi.cr/indicadores-economicos/indice-de-precios-al-consumo' },
]