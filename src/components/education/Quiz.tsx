import { useState } from 'react'
import { QUIZ_QUESTIONS, evaluateQuiz } from '../../constants/quiz'

/**
 * Quiz educativo interactivo (Fase 2 — Educación). Selección de respuesta por
 * pregunta (radios nativos accesibles), evaluación con `evaluateQuiz` y
 * explicación por pregunta al enviar. El resultado se anuncia con aria-live.
 */
export function Quiz() {
  const [selections, setSelections] = useState<Record<string, number>>({})
  const [submitted, setSubmitted] = useState(false)

  const result = evaluateQuiz(QUIZ_QUESTIONS, selections)
  const allAnswered = result.total === QUIZ_QUESTIONS.length

  const select = (qid: string, index: number) => {
    if (submitted) return
    setSelections(prev => ({ ...prev, [qid]: index }))
  }

  const reset = () => {
    setSelections({})
    setSubmitted(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-[#eeffff]">Pon a prueba lo aprendido</h2>
        <p className="text-gray-500 dark:text-[#a6accd] mt-2">
          Responde este breve quiz sobre pensiones. Al enviar verás tu resultado y la explicación de cada respuesta.
        </p>
      </div>

      {submitted && (
        <div
          className="rounded-xl border border-blue-200 dark:border-[#2b2a3e] bg-blue-50 dark:bg-[#252a3a] p-5"
          role="status"
          aria-live="polite"
        >
          <p className="text-sm font-medium text-blue-900 dark:text-[#89ddff]">Resultado</p>
          <p className="text-3xl font-bold text-blue-900 dark:text-[#89ddff]">
            {result.correct} de {result.total} correctas ({result.percent}%)
          </p>
        </div>
      )}

      <ol className="space-y-5">
        {QUIZ_QUESTIONS.map((q, qi) => (
          <li key={q.id}>
            <fieldset className="bg-white dark:bg-[#25293c] rounded-xl border border-gray-200 dark:border-[#34324a] p-5">
              <legend className="text-sm font-semibold text-gray-800 dark:text-[#eeffff] px-1">
                {qi + 1}. {q.question}
              </legend>
              <div className="space-y-2 mt-2">
                {q.options.map((opt, oi) => {
                  const chosen = selections[q.id] === oi
                  const isCorrect = oi === q.answer
                  const showState = submitted && (chosen || isCorrect)
                  return (
                    <label
                      key={oi}
                      className={`flex items-start gap-2 p-2 rounded-lg cursor-pointer border transition-colors ${
                        showState
                          ? isCorrect
                            ? 'border-green-300 bg-green-50 dark:bg-[#1f2e26]'
                            : chosen
                              ? 'border-red-300 bg-red-50 dark:bg-[#2e2023]'
                              : 'border-transparent'
                          : chosen
                            ? 'border-[#7c4dff] bg-blue-50 dark:bg-[#262a3a]'
                            : 'border-transparent hover:bg-gray-50 dark:hover:bg-[#2b2f42]'
                      }`}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        value={oi}
                        checked={chosen}
                        onChange={() => select(q.id, oi)}
                        disabled={submitted}
                        className="mt-1"
                      />
                      <span className="text-sm text-gray-700 dark:text-[#a6accd]">{opt}</span>
                    </label>
                  )
                })}
              </div>
              {submitted && (
                <p className="text-sm text-gray-600 dark:text-[#a6accd] mt-3 pt-3 border-t border-gray-100 dark:border-[#2b2a3e]">
                  {q.explanation}
                </p>
              )}
            </fieldset>
          </li>
        ))}
      </ol>

      <div className="flex gap-3">
        {!submitted ? (
          <button
            type="button"
            onClick={() => setSubmitted(true)}
            disabled={!allAnswered}
            className="px-4 py-2 text-sm font-medium text-white bg-[#7c4dff] hover:opacity-90 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#82aaff]"
          >
            {allAnswered ? 'Ver resultado' : `Responde todas (${result.total}/${QUIZ_QUESTIONS.length})`}
          </button>
        ) : (
          <button
            type="button"
            onClick={reset}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-[#a6accd] bg-white dark:bg-[#25293c] border border-gray-300 dark:border-[#34324a] rounded-lg hover:bg-gray-100 dark:hover:bg-[#303348] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#82aaff]"
          >
            Intentar de nuevo
          </button>
        )}
      </div>
    </div>
  )
}