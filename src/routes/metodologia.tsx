import { createFileRoute } from '@tanstack/react-router'
import { MethodologyView } from '../components/education/MethodologyView'
import { ErrorBoundary } from '../components/ui/ErrorBoundary'
import { usePageMeta } from '../hooks/usePageMeta'

function MetodologiaPage() {
  usePageMeta({
    title: 'Metodología · SUPEN Stats',
    description:
      'Cómo SUPEN Stats obtiene, transforma e interpreta los datos de la Superintendencia de Pensiones de Costa Rica, y sus limitaciones.',
    path: '/metodologia',
  })
  return (
    <section
      role="tabpanel"
      id="panel-metodologia"
      aria-labelledby="tab-metodologia"
      tabIndex={0}
      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg"
    >
      <ErrorBoundary>
        <MethodologyView />
      </ErrorBoundary>
    </section>
  )
}

export const Route = createFileRoute('/metodologia')({
  component: MetodologiaPage,
})