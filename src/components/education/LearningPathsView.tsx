import { Link } from '@tanstack/react-router'
import { LEARNING_PATHS } from '../../constants/learningPaths'

/**
 * Vista de rutas de aprendizaje (Fase 2 — Educación). Muestra rutas guiadas
 * ordenadas; cada paso enlaza al reporte correspondiente y a los términos del
 * glosario para profundizar.
 */
export function LearningPathsView() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-[#eeffff]">Rutas de aprendizaje</h2>
        <p className="text-gray-500 dark:text-[#a6accd] mt-2">
          Recorridos guiados para entender el sistema de pensiones paso a paso, de lo básico a lo avanzado.
        </p>
      </div>

      {LEARNING_PATHS.map(path => (
        <section
          key={path.id}
          className="bg-white dark:bg-[#25293c] rounded-xl border border-gray-200 dark:border-[#34324a] p-6 shadow-sm space-y-4"
        >
          <header>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-[#eeffff]">{path.title}</h3>
            <p className="text-xs text-gray-400 dark:text-[#676e95] mt-1">{path.audience}</p>
            <p className="text-sm text-gray-600 dark:text-[#a6accd] mt-2">
              <span className="font-medium text-gray-700 dark:text-[#c7cbe0]">Al terminar:</span> {path.outcome}
            </p>
          </header>

          <ol className="space-y-3">
            {path.steps.map((step, i) => (
              <li key={step.title} className="flex gap-3">
                <span
                  className="shrink-0 w-7 h-7 rounded-full bg-[#7c4dff] text-white text-sm font-bold flex items-center justify-center"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="font-medium text-gray-800 dark:text-[#eeffff]">{step.title}</p>
                  <p className="text-sm text-gray-600 dark:text-[#a6accd]">{step.description}</p>
                  {(step.reportTo || (step.terms && step.terms.length > 0)) && (
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      {step.reportTo && (
                        <Link
                          to={step.reportTo}
                          className="text-xs px-2 py-0.5 rounded-full bg-[#7c4dff] text-white hover:opacity-90"
                        >
                          Abrir reporte →
                        </Link>
                      )}
                      {step.terms?.map(term => (
                        <Link
                          key={term}
                          to="/glosario"
                          hash={`glosario-${encodeURIComponent(term)}`}
                          className="text-xs px-2 py-0.5 rounded-full bg-blue-50 dark:bg-[#2b2a3e] text-blue-700 dark:text-[#82aaff] hover:underline"
                        >
                          {term}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  )
}