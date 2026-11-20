/**
 * Banco de preguntas del quiz educativo (Fase 2 — Educación) y su lógica de
 * evaluación PURA (sin React) para poder testearla de forma aislada.
 */

export interface QuizQuestion {
  id: string
  /** Enunciado de la pregunta. */
  question: string
  /** Opciones de respuesta (la correcta está marcada en `answer`). */
  options: string[]
  /** Índice de la opción correcta. */
  answer: number
  /** Explicación que se muestra al responder. */
  explanation: string
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'comision',
    question:
      '¿Qué efecto tiene una comisión más baja sobre tus ahorros de pensión?',
    options: [
      'Deja más dinero invertido trabajando para ti',
      'No tiene ningún efecto',
      'Reduce la rentabilidad automáticamente',
      'Solo importa al momento de pensionarse',
    ],
    answer: 0,
    explanation:
      'La comisión se descuenta de tu saldo. Cuanto menor sea, mayor parte de tu dinero permanece invertida y se beneficia del interés compuesto.',
  },
  {
    id: 'rentabilidad-real',
    question:
      'Si la rentabilidad nominal es 5% y la inflación es 4%, la rentabilidad real aproximada es:',
    options: ['9%', '1%', '5%', '-4%'],
    answer: 1,
    explanation:
      'La rentabilidad real descuenta la inflación. Aproximadamente 5% − 4% = 1% de aumento real en el poder adquisitivo.',
  },
  {
    id: 'afiliado-aporte',
    question: '¿Cuál es la diferencia entre un afiliado y un aportante?',
    options: [
      'Son exactamente lo mismo',
      'El aportante es quien cotiza activamente; el afiliado puede no estar cotizando',
      'El afiliado es siempre pensionado',
      'El aportante es la operadora',
    ],
    answer: 1,
    explanation:
      'Una persona afiliada tiene cuenta en la operadora; una aportante además está cotizando de forma activa (usualmente por empleo formal).',
  },
  {
    id: 'poder-adquisitivo',
    question:
      '¿Para qué sirve ajustar una pensión futura por inflación (poder adquisitivo)?',
    options: [
      'Para calcular la comisión',
      'Para saber cuánto valdría ese dinero en términos de hoy',
      'Para aumentar la rentabilidad',
      'Para elegir operadora',
    ],
    answer: 1,
    explanation:
      'Ajustar por inflación muestra el equivalente en dinero de hoy, evitando sobreestimar lo que podrás comprar con la pensión nominal futura.',
  },
  {
    id: 'diversificacion',
    question: '¿Por qué es importante que el portafolio esté diversificado?',
    options: [
      'Para que todas las inversiones rindan igual',
      'Para reducir el riesgo: si un instrumento baja, otros pueden compensar',
      'Para eliminar por completo el riesgo',
      'Para pagar menos impuestos',
    ],
    answer: 1,
    explanation:
      'La diversificación reparte el dinero en varios instrumentos; reduce el riesgo pero no lo elimina por completo.',
  },
]

export interface QuizResult {
  /** Cantidad de respuestas correctas. */
  correct: number
  /** Total de preguntas. */
  total: number
  /** Porcentaje de aciertos (0–100). */
  percent: number
}

/**
 * Evalúa las respuestas seleccionadas contra el banco de preguntas.
 * `selections` mapea idPregunta → índiceElegido. Solo cuenta preguntas con
 * selección válida en el denominador.
 */
export function evaluateQuiz(
  questions: QuizQuestion[],
  selections: Record<string, number>,
): QuizResult {
  let answered = 0
  let correct = 0
  for (const q of questions) {
    const sel = selections[q.id]
    if (sel == null || sel < 0 || sel >= q.options.length) continue
    answered += 1
    if (sel === q.answer) correct += 1
  }
  return {
    correct,
    total: answered,
    percent: answered === 0 ? 0 : Math.round((correct / answered) * 100),
  }
}