import { createFileRoute } from '@tanstack/react-router'
import { WelcomeScreen } from '../components/layout/WelcomeScreen'
import { ErrorBoundary } from '../components/ui/ErrorBoundary'

export const Route = createFileRoute('/')({
  component: () => (
    <section
      role="tabpanel"
      id="panel-inicio"
      aria-labelledby="tab-inicio"
      tabIndex={0}
      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg"
    >
      <ErrorBoundary>
        <WelcomeScreen />
      </ErrorBoundary>
    </section>
  ),
})
