/**
 * Glosario de términos del sistema de pensiones de Costa Rica (Fase 2 —
 * Educación). Definiciones en lenguaje sencillo pensadas para la ciudadanía.
 * `related` enlaza términos para facilitar el aprendizaje navegable.
 */

export interface GlossaryTerm {
  /** Término canónico. */
  term: string
  /** Definición breve y clara. */
  definition: string
  /** Términos relacionados (se usan como enlaces cruzados). */
  related?: string[]
}

export const GLOSSARY: GlossaryTerm[] = [
  {
    term: 'OPC',
    definition:
      'Operadora de Pensiones Complementarias. Es la entidad (privada o pública) autorizada por SUPEN que administra los fondos de pensiones de sus afiliados y cobra una comisión por ello.',
    related: ['ROP', 'Comisión', 'SUPEN'],
  },
  {
    term: 'ROP',
    definition:
      'Regime de Pensiones del Régimen Obligatorio de Pensamenos Complementario. Es el ahorro complementario obligatorio que se suma a la pensión básica de la CCSS.',
    related: ['FCL', 'VOL', 'OPC'],
  },
  {
    term: 'FCL',
    definition:
      'Fondo de Capitalización Laboral. Es un ahorro al que tienen derecho las personas trabajadoras cuando su contrato termina por despido, entre otros supuestos.',
    related: ['ROP', 'VOL'],
  },
  {
    term: 'VOL',
    definition:
      'Voluntario. Es el ahorro de pensión que la persona decide hacer de forma adicional y voluntaria, con beneficios tributarios, para complementar su pensión.',
    related: ['ROP', 'Pensión'],
  },
  {
    term: 'Comisión',
    definition:
      'Es el porcentaje que la operadora cobra sobre el saldo de la cuenta por administrar los ahorros. Una comisión más baja deja más dinero trabajando para el afiliado.',
    related: ['OPC', 'Rentabilidad'],
  },
  {
    term: 'Rentabilidad',
    definition:
      'Es la ganancia (o pérdida) que generan las inversiones del fondo en un periodo, expresada como porcentaje. Puede ser nominal (sin ajustar por inflación) o real (ajustada).',
    related: ['Rentabilidad nominal', 'Rentabilidad real', 'Inflación'],
  },
  {
    term: 'Rentabilidad nominal',
    definition:
      'Es el rendimiento tal como lo publica la operadora, sin descontar el efecto de la inflación. Un 5% nominal con 4% de inflación equivale a cerca de 1% real.',
    related: ['Rentabilidad', 'Rentabilidad real', 'Inflación'],
  },
  {
    term: 'Rentabilidad real',
    definition:
      'Es la rentabilidad ajustada por inflación; refleja el aumento real del poder adquisitivo de los ahorros. Puede ser menor que la nominal e incluso negativa.',
    related: ['Rentabilidad nominal', 'Inflación'],
  },
  {
    term: 'Inflación',
    definition:
      'Es el aumento generalizado de los precios. Reduce el poder adquisitivo del dinero: con la misma cantidad de colones se compra menos con el paso del tiempo.',
    related: ['Poder adquisitivo', 'Rentabilidad real'],
  },
  {
    term: 'Poder adquisitivo',
    definition:
      'Es la cantidad de bienes y servicios que se pueden comprar con una suma de dinero. Ajustar una pensión futura por inflación muestra su equivalente en dinero de hoy.',
    related: ['Inflación', 'Pensión'],
  },
  {
    term: 'Portafolio',
    definition:
      'Es el conjunto de inversiones (bonos, acciones, depósitos, etc.) en las que la operadora coloca el dinero del fondo. La diversificación busca reducir el riesgo.',
    related: ['ISIN', 'Rentabilidad'],
  },
  {
    term: 'ISIN',
    definition:
      'International Securities Identification Number. Es un código único que identifica un instrumento financiero (por ejemplo, un bono) a nivel internacional.',
    related: ['Portafolio'],
  },
  {
    term: 'Afiliado',
    definition:
      'Es la persona que tiene una cuenta de ahorro de pensión en una operadora. No siempre está cotizando: puede estar afiliada sin aportar de forma activa.',
    related: ['Aportante', 'OPC'],
  },
  {
    term: 'Aportante',
    definition:
      'Es la persona afiliada que está cotizando activamente (por lo general porque tiene empleo formal). Los aportes alimentan su cuenta de pensión.',
    related: ['Afiliado'],
  },
  {
    term: 'Libre transferencia',
    definition:
      'Es el traslado de los ahorros y del afiliado de una operadora a otra (traslado o portabilidad). Se refleja como movimientos entre OPCs en el reporte de traslados.',
    related: ['OPC', 'Afiliado'],
  },
  {
    term: 'CCSS',
    definition:
      'Caja Costarricense de Seguro Social. Administra el régimen básico de pensiones (IVM) del que proviene la pensión principal de la mayoría de las personas.',
    related: ['Pensión', 'ROP'],
  },
  {
    term: 'SUPEN',
    definition:
      'Superintendencia de Pensiones. Es el órgano del Estado que supervisa y regula el sistema de pensiones y publica las estadísticas oficiales que usa este dashboard.',
    related: ['OPC', 'ROP'],
  },
  {
    term: 'Pensión',
    definition:
      'Es el pago periódico (por lo general mensual) que recibe una persona al retirarse o cumplir los requisitos del régimen. Puede provenir de la CCSS y/o de los fondos complementarios (ROP).',
    related: ['ROP', 'CCSS', 'Poder adquisitivo'],
  },
]

/** Mapa término→definición para búsquedas rápidas y enlaces cruzados. */
export const GLOSSARY_BY_TERM: Record<string, GlossaryTerm> = Object.fromEntries(
  GLOSSARY.map(t => [t.term, t]),
)