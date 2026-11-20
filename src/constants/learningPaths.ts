/**
 * Rutas de aprendizaje guiadas (Fase 2 — Educación). Cada ruta agrupa reportes y
 * conceptos en un orden sugerido para que la persona progrese de lo básico a lo
 * avanzado. `reportTo` es la ruta interna del dashboard a la que enlaza el paso.
 */

export interface LearningStep {
  /** Título del paso. */
  title: string
  /** Qué aprenderá la persona en este paso. */
  description: string
  /** Ruta del reporte relacionado (si aplica). */
  reportTo?: string
  /** Términos del glosario relevantes. */
  terms?: string[]
}

export interface LearningPath {
  id: string
  title: string
  /** Público objetivo y duración estimada. */
  audience: string
  /** Resultado esperado al completar la ruta. */
  outcome: string
  steps: LearningStep[]
}

export const LEARNING_PATHS: LearningPath[] = [
  {
    id: 'primeros-pasos',
    title: 'Primeros pasos: entiende tu pensión',
    audience: 'Cualquier persona que cotiza o está por pensionarse · ~10 min',
    outcome: 'Sabrás de qué se compone tu pensión y qué actores intervienen.',
    steps: [
      {
        title: '¿Qué es una operadora de pensiones (OPC)?',
        description:
          'Antes de mirar gráficos, entiende quién administra tus ahorros y por qué importa compararlas.',
        terms: ['OPC', 'SUPEN', 'ROP'],
      },
      {
        title: 'Compara las comisiones',
        description:
          'Observa cuánto cobra cada operadora por administrar el fondo. Menos comisión deja más dinero para ti.',
        reportTo: '/comisiones',
        terms: ['Comisión'],
      },
      {
        title: 'Revisa la rentabilidad',
        description:
          'Compara cuánto rinde cada operadora y recuerda que rentabilidad pasada no garantiza resultados futuros.',
        reportTo: '/rendimiento',
        terms: ['Rentabilidad'],
      },
    ],
  },
  {
    id: 'rentabilidad-real',
    title: 'Rentabilidad real: el efecto de la inflación',
    audience: 'Personas que quieren comparar más allá de la cifra nominal · ~12 min',
    outcome: 'Entenderás por qué el rendimiento nominal y el real pueden diferir mucho.',
    steps: [
      {
        title: 'Nominal vs. real',
        description:
          'Distingue el rendimiento publicado del que realmente aumenta tu poder adquisitivo.',
        reportTo: '/rendimiento-real',
        terms: ['Rentabilidad nominal', 'Rentabilidad real', 'Inflación'],
      },
      {
        title: 'Comisión vs. rentabilidad',
        description:
          'Visualiza el balance entre lo que cobra la operadora y lo que rinde tu fondo.',
        reportTo: '/comision-rentabilidad',
        terms: ['Comisión', 'Rentabilidad'],
      },
      {
        title: 'Proyecta tu pensión',
        description:
          'Usa el simulador para ver cómo crecería tu ahorro y qué pasa con el poder adquisitivo.',
        reportTo: '/simulador',
        terms: ['Poder adquisitivo', 'Pensión'],
      },
    ],
  },
  {
    id: 'sistema-pensiones',
    title: 'El sistema completo: demografía y sostenibilidad',
    audience: 'Estudiantes, docentes e investigadores · ~15 min',
    outcome: 'Comprenderás la estructura demográfica del sistema y su sostenibilidad.',
    steps: [
      {
        title: '¿Cuántos somos y qué edad tenemos?',
        description:
          'Explora la pirámide poblacional para entender la proporción de activos y pensionados.',
        reportTo: '/piramide',
        terms: ['Afiliado', 'Aportante', 'Pensión'],
      },
      {
        title: 'Afiliados y aportantes',
        description:
          'Distingue cuántas personas están afiliadas de cuántas cotizan activamente.',
        reportTo: '/afiliados',
        terms: ['Afiliado', 'Aportante'],
      },
      {
        title: 'Movimientos entre operadoras',
        description:
          'Revisa los traslados y la libre transferencia para entender la movilidad del sistema.',
        reportTo: '/traslados',
        terms: ['Libre transferencia', 'OPC'],
      },
    ],
  },
]