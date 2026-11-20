import { METHODOLOGY, METHODOLOGY_REFERENCES } from '../../constants/methodology'

/**
 * Vista de metodología (Fase 2 — Educación): transparencia sobre el origen de
 * los datos, su transformación y limitaciones. Referencias a fuentes oficiales.
 */
export function MethodologyView() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-[#eeffff]">Metodología</h2>
        <p className="text-gray-500 dark:text-[#a6accd] mt-2">
          Cómo obtenemos, transformamos e interpretamos los datos de este dashboard. La transparencia es clave para usar bien las cifras.
        </p>
      </div>

      <div className="space-y-4">
        {METHODOLOGY.map(section => (
          <section
            key={section.id}
            id={`metodologia-${section.id}`}
            className="bg-white dark:bg-[#25293c] rounded-xl border border-gray-200 dark:border-[#34324a] p-6 shadow-sm scroll-mt-24"
          >
            <h3 className="text-lg font-semibold text-gray-800 dark:text-[#eeffff]">{section.title}</h3>
            <p className="text-sm text-gray-600 dark:text-[#a6accd] mt-2">{section.body}</p>
            {section.bullets && section.bullets.length > 0 && (
              <ul className="mt-3 space-y-1 list-disc list-inside text-sm text-gray-600 dark:text-[#a6accd]">
                {section.bullets.map(b => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <div className="bg-blue-50 dark:bg-[#292d3e] border border-blue-200 dark:border-[#2b2a3e] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-blue-900 dark:text-[#89ddff]">Referencias</h3>
        <ul className="mt-2 space-y-1">
          {METHODOLOGY_REFERENCES.map(ref => (
            <li key={ref.url}>
              <a
                href={ref.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-700 dark:text-[#82aaff] hover:underline"
              >
                {ref.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}