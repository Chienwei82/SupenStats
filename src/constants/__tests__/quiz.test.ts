import { describe, it, expect } from 'vitest'
import { evaluateQuiz, QUIZ_QUESTIONS } from '../quiz'

describe('evaluateQuiz', () => {
  it('cuenta solo las preguntas respondidas y calcula el porcentaje', () => {
    const [q1, q2] = QUIZ_QUESTIONS
    // q1 correcta (answer 0), q2 incorrecta.
    const result = evaluateQuiz(QUIZ_QUESTIONS, {
      [q1!.id]: q1!.answer,
      [q2!.id]: (q2!.answer + 1) % q2!.options.length,
    })
    expect(result.correct).toBe(1)
    expect(result.total).toBe(2)
    expect(result.percent).toBe(50)
  })

  it('ignora selecciones fuera de rango o inexistentes', () => {
    const [q1] = QUIZ_QUESTIONS
    const result = evaluateQuiz(QUIZ_QUESTIONS, {
      [q1!.id]: 999,
      inexistente: 0,
    })
    expect(result.total).toBe(0)
    expect(result.percent).toBe(0)
  })

  it('100% cuando todas las respuestas son correctas', () => {
    const selections = Object.fromEntries(QUIZ_QUESTIONS.map(q => [q.id, q.answer]))
    const result = evaluateQuiz(QUIZ_QUESTIONS, selections)
    expect(result.correct).toBe(QUIZ_QUESTIONS.length)
    expect(result.total).toBe(QUIZ_QUESTIONS.length)
    expect(result.percent).toBe(100)
  })

  it('cada pregunta tiene una respuesta válida y explicación', () => {
    for (const q of QUIZ_QUESTIONS) {
      expect(q.answer).toBeGreaterThanOrEqual(0)
      expect(q.answer).toBeLessThan(q.options.length)
      expect(q.explanation.length).toBeGreaterThan(0)
    }
  })
})