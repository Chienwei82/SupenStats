import { createFileRoute } from '@tanstack/react-router'
import { LearningPathsView } from '../components/education/LearningPathsView'
import { Quiz } from '../components/education/Quiz'
import { ErrorBoundary } from '../components/ui/ErrorBoundary'
import { usePageMeta } from '../hooks/usePageMeta'

function AprenderPage() {
  usePageMeta({
    title: 'Aprender · SUPEN Stats',
    description:
      'Rutas de aprendizaje guiadas y un quiz interactivo para entender el sistema de pensiones de Costa Rica paso a paso.',
    path: '/aprender',
  })
  return (
    <section
      role="tabpanel"
      id="panel-aprender"
      aria-labelledby="tab-aprender"
      tabIndex={0}
      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg space-y-10"
    >
      <ErrorBoundary>
        <LearningPathsView />
        <div className="border-t border-gray-200 dark:border-[#34324a] pt-8">
          <Quiz />
        </div>
      </ErrorBoundary>
    </section>
  )
}

export const Route = createFileRoute('/aprender')({
  component: AprenderPage,
})