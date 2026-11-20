import { createFileRoute } from '@tanstack/react-router'
import { Comparador } from '../components/Compare/Comparador'
import { ErrorBoundary } from '../components/ui/ErrorBoundary'
import { usePageMeta } from '../hooks/usePageMeta'

function ComparadorPage() {
  usePageMeta({
    title: 'Comparador de operadoras · SUPEN Stats',
    description:
      'Compara la rentabilidad de dos operadoras de pensiones (OPC) de Costa Rica en el tiempo, con métrica nominal o real y exportación de datos.',
    path: '/comparador',
  })
  return (
    <ErrorBoundary>
      <Comparador />
    </ErrorBoundary>
  )
}

export const Route = createFileRoute('/comparador')({
  component: ComparadorPage,
})