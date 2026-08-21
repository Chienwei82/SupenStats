// Notas educativas para cada gráfico del dashboard.
// El objetivo es explicar, en lenguaje sencillo, qué significa cada gráfico
// y cómo interpretarlo, para apoyar la educación financiera de la ciudadanía.
// Cada nota incluye referencias a fuentes oficiales (SUPEN) y complementarias.

export interface ChartReference {
  label: string
  url: string
}

export interface ChartNote {
  /** Título corto que se muestra en el encabezado del acordeón. */
  title: string
  /** Explicación en lenguaje sencillo de qué muestra el gráfico y cómo leerlo. */
  body: string
  /** Referencias externas (SUPEN y otras fuentes). */
  references: ChartReference[]
}

export const CHART_NOTES: Record<string, ChartNote> = {
  rendimiento: {
    title: '¿Cómo leer este gráfico?',
    body:
      'Este gráfico muestra la rentabilidad (rendimiento) que cada operadora de pensiones (OPC) ha generado sobre los ahorros de sus afiliados a lo largo del tiempo. La rentabilidad se expresa como porcentaje (%) y representa cuánto creció el dinero invertido en un año. Un valor positivo significa que el fondo ganó dinero; uno negativo, que perdió. Al comparar operadoras, recuerde que la rentabilidad pasada no garantiza resultados futuros, y que un buen rendimiento debe evaluarse junto con las comisiones que cobra cada operadora.',
    references: [
      { label: 'SUPEN — Estadísticas del sistema de pensiones', url: 'https://www.supen.fi.cr/estadisticas' },
      { label: 'SUPEN — ¿Cómo se compone su pensión?', url: 'https://www.supen.fi.cr/como-se-compone' },
      { label: 'SUPEN — ¿Cómo obtener una mejor pensión?', url: 'https://www.supen.fi.cr/como-obtener-una-mejor-pension' },
    ],
  },
  comisiones: {
    title: '¿Cómo leer este gráfico?',
    body:
      'Este gráfico muestra la comisión de administración que cada operadora (OPC) cobra por gestionar los ahorros de sus afiliados. La comisión se expresa como porcentaje del saldo y se descuenta de la cuenta de cada persona. Una comisión más baja deja más dinero trabajando para el afiliado, por lo que es un factor clave al comparar operadoras. Desde la regulación vigente, las comisiones quedaron unificadas en 0.35% para todas las operadoras.',
    references: [
      { label: 'SUPEN — Estadísticas del sistema de pensiones', url: 'https://www.supen.fi.cr/estadisticas' },
      { label: 'SUPEN — ¿Cuál es mi operadora de pensiones?', url: 'https://www.supen.fi.cr/cual-es-mi-operadora-de-pensiones' },
    ],
  },
  portafolio: {
    title: '¿Cómo leer este gráfico?',
    body:
      'Este gráfico de dona muestra cómo se distribuye el dinero del fondo de pensiones entre distintos tipos de instrumentos de inversión (por ejemplo, bonos del Gobierno, acciones, depósitos a plazo, etc.). Cada porción representa el porcentaje del total invertido en ese tipo de instrumento. Una cartera diversificada reparte el dinero en varios instrumentos para reducir el riesgo: si un tipo de inversión baja, otros pueden compensar. Es normal que la distribución cambie con el tiempo según las condiciones del mercado.',
    references: [
      { label: 'SUPEN — Estadísticas del sistema de pensiones', url: 'https://www.supen.fi.cr/estadisticas' },
      { label: 'SUPEN — ¿Cómo se compone su pensión?', url: 'https://www.supen.fi.cr/como-se-compone' },
    ],
  },
  afiliados: {
    title: '¿Cómo leer este gráfico?',
    body:
      'Este gráfico muestra cuántas personas están afiliadas a cada operadora de pensiones (OPC) a lo largo del tiempo. Un afiliado es una persona que tiene una cuenta de pensión en esa operadora. El crecimiento del número de afiliados refleja, en parte, el crecimiento del empleo formal y la confianza de la población en cada operadora. Es un dato de tamaño del sistema, no de calidad del servicio ni de rentabilidad.',
    references: [
      { label: 'SUPEN — Estadísticas del sistema de pensiones', url: 'https://www.supen.fi.cr/estadisticas' },
      { label: 'SUPEN — ¿Cuál es mi operadora de pensiones?', url: 'https://www.supen.fi.cr/cual-es-mi-operadora-de-pensiones' },
    ],
  },
  activos: {
    title: '¿Cómo leer este gráfico?',
    body:
      'Este gráfico muestra el valor total de los activos netos que administra cada operadora (OPC). Los activos netos son el dinero acumulado del fondo de pensiones, es decir, el valor de las inversiones menos las deudas u obligaciones. Es una medida del tamaño del fondo que cada operadora gestiona. Un fondo más grande no significa necesariamente mejor rendimiento, pero sí refleja la confianza y el volumen de ahorros que la operadora administra.',
    references: [
      { label: 'SUPEN — Estadísticas del sistema de pensiones', url: 'https://www.supen.fi.cr/estadisticas' },
      { label: 'SUPEN — ¿Cómo se compone su pensión?', url: 'https://www.supen.fi.cr/como-se-compone' },
    ],
  },
  beneficios: {
    title: '¿Cómo leer este gráfico?',
    body:
      'Este gráfico muestra cuántas personas reciben una pensión (pensionados) a través de cada operadora en la fecha más reciente. Un pensionado es una persona que ya se jubiló y recibe pagos periódicos de su fondo de pensiones. Este dato ayuda a entender cuántas personas dependen de cada operadora para su ingreso de jubilación.',
    references: [
      { label: 'SUPEN — Pensionados', url: 'https://www.supen.fi.cr/pensionados' },
      { label: 'SUPEN — Trámites para pensionarme', url: 'https://www.supen.fi.cr/tramites-para-pensionarme' },
    ],
  },
  cuentas: {
    title: '¿Cómo leer este gráfico?',
    body:
      'Este gráfico muestra la evolución del activo neto del fondo de cada operadora (OPC), es decir, el valor total de los ahorros administrados. A diferencia del gráfico de activos por operadora, aquí se observa la tendencia en el tiempo. Una línea en crecimiento indica que el fondo está acumulando más recursos, lo que puede deberse a aportes, rendimientos o ambos.',
    references: [
      { label: 'SUPEN — Estadísticas del sistema de pensiones', url: 'https://www.supen.fi.cr/estadisticas' },
      { label: 'SUPEN — ¿Cómo se compone su pensión?', url: 'https://www.supen.fi.cr/como-se-compone' },
    ],
  },
  transferencias: {
    title: '¿Cómo leer este gráfico?',
    body:
      'Este gráfico muestra cuántas personas (y cuánto dinero) se trasladaron desde cada operadora hacia otras, mediante la libre transferencia. En Costa Rica, los afiliados pueden cambiarse de operadora de pensiones si lo desean. Un alto número de transferencias salientes puede indicar insatisfacción o mejores condiciones en otras operadoras. Es un dato útil para comparar la permanencia de los afiliados.',
    references: [
      { label: 'SUPEN — ¿Cuál es mi operadora de pensiones?', url: 'https://www.supen.fi.cr/cual-es-mi-operadora-de-pensiones' },
      { label: 'SUPEN — Estadísticas', url: 'https://www.supen.fi.cr/estadisticas' },
    ],
  },
  aportantes: {
    title: '¿Cómo leer este gráfico?',
    body:
      'Este gráfico compara, para cada operadora, el número de afiliados (personas con cuenta) frente al número de aportantes (personas que están realizando aportes de forma activa). La diferencia entre ambos puede deberse a personas que tienen cuenta pero no están aportando en ese momento (por ejemplo, por desempleo o informalidad). Es un indicador de la actividad real del sistema de pensiones.',
    references: [
      { label: 'SUPEN — Estadísticas del sistema de pensiones', url: 'https://www.supen.fi.cr/estadisticas' },
      { label: 'SUPEN — Trabajadores', url: 'https://www.supen.fi.cr/trabajadores' },
    ],
  },
  demografia: {
    title: '¿Cómo leer este gráfico?',
    body:
      'Este gráfico muestra la distribución de los afiliados por rango de edad y por sexo, en la fecha más reciente. Permite ver qué tan joven o envejecida es la población afiliada al sistema de pensiones. Una población más joven significa que hay más años por delante para acumular ahorros; una población mayor implica que se acercan más personas a la jubilación. Es un dato clave para entender la sostenibilidad del sistema.',
    references: [
      { label: 'SUPEN — Estadísticas del sistema de pensiones', url: 'https://www.supen.fi.cr/estadisticas' },
      { label: 'SUPEN — ¿Cómo se compone su pensión?', url: 'https://www.supen.fi.cr/como-se-compone' },
    ],
  },
  isin: {
    title: '¿Cómo leer este gráfico?',
    body:
      'Este gráfico muestra el portafolio de inversión desglosado por instrumento específico, identificado por su código ISIN (un código internacional que identifica cada valor o título). Cada porción representa el porcentaje del fondo invertido en ese instrumento concreto. Es una vista más detallada que el gráfico de portafolio por tipo de instrumento, y permite ver en qué valores específicos está invertido el dinero de los afiliados.',
    references: [
      { label: 'SUPEN — Estadísticas del sistema de pensiones', url: 'https://www.supen.fi.cr/estadisticas' },
      { label: 'SUPEN — ¿Cómo se compone su pensión?', url: 'https://www.supen.fi.cr/como-se-compone' },
    ],
  },
}