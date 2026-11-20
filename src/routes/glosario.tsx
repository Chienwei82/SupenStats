import { createFileRoute } from '@tanstack/react-router'
import { GlossaryView } from '../components/education/GlossaryView'
import { ErrorBoundary } from '../components/ui/ErrorBoundary'
import { usePageMeta } from '../hooks/usePageMeta'

function GlosarioPage() {
  usePageMeta({
    title: 'Glosario · SUPEN Stats',
    description:
      'Términos clave del sistema de pensiones de Costa Rica (OPC, ROP, comisión, rentabilidad, inflación) explicados en lenguaje sencillo.',
    path: '/glosario',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'DefinedTermSet',
      name: 'Glosario del sistema de pensiones de Costa Rica',
      description: 'Definiciones de términos del sistema de pensiones de Costa Rica.',
    },
  })
  return (
    <section
      role="tabpanel"
      id="panel-glosario"
      aria-labelledby="tab-glosario"
      tabIndex={0}
      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg"
    >
      <ErrorBoundary>
        <GlossaryView />
      </ErrorBoundary>
    </section>
  )
}

export const Route = createFileRoute('/glosario')({
  component: GlosarioPage,
})