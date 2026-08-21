import { CHART_NOTES, type ChartNote } from '../../constants/chartNotes'

interface Props {
  /** Clave del gráfico en CHART_NOTES (ej. 'rendimiento', 'comisiones'). */
  noteId: string
}

/**
 * Cuadro colapsable (acordeón) que muestra una nota educativa al pie de cada
 * gráfico. Explica en lenguaje sencillo qué significa el gráfico y cómo
 * interpretarlo, con referencias a fuentes oficiales y complementarias.
 */
export function ChartNote({ noteId }: Props) {
  const note: ChartNote | undefined = CHART_NOTES[noteId]
  if (!note) return null

  return (
    <details className="group mt-4 rounded-lg border border-blue-200 bg-blue-50">
      <summary className="flex items-center justify-between gap-2 px-4 py-2.5 cursor-pointer text-sm font-medium text-blue-900 select-none">
        <span className="flex items-center gap-2">
          <svg
            className="w-4 h-4 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4M12 16v-4" />
          </svg>
          {note.title}
        </span>
        <svg
          className="w-4 h-4 shrink-0 transition-transform group-open:rotate-180"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m6 9l6 6 6-6" />
        </svg>
      </summary>
      <div className="px-4 py-3 text-sm text-gray-700 space-y-3">
        <p>{note.body}</p>
        {note.references.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Referencias para aprender más
            </p>
            <ul className="space-y-1">
              {note.references.map(ref => (
                <li key={ref.url}>
                  <a
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700 hover:underline"
                  >
                    {ref.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </details>
  )
}