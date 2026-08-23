import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  message: string
  /** Incrementa en cada reintento para forzar re-montaje de children. */
  attempt: number
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '', attempt: 0 }

  static getDerivedStateFromError(error: unknown): Partial<State> {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : 'Error desconocido',
    }
  }

  componentDidCatch(error: unknown, info: { componentStack?: string | null }) {
    // Log para diagnóstico; en el futuro podría reportarse a un servicio.
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  private handleRetry = () => {
    // Re-montar children con una key nueva garantiza que un componente cuyo
    // estado interno quedó corrupto se reconstruya desde cero.
    this.setState(prev => ({ hasError: false, message: '', attempt: prev.attempt + 1 }))
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 dark:bg-[#3a2a3e] rounded-xl border border-red-200 dark:border-[#5a3543] text-center" role="alert">
          <div className="text-red-500 dark:text-[#f07178] text-4xl mb-3" aria-hidden="true">!</div>
          <p className="text-red-700 dark:text-[#ffcb6b] font-medium mb-1">Ocurrió un error inesperado</p>
          <p className="text-red-500 dark:text-[#f07178] text-sm mb-4">{this.state.message}</p>
          <button
            onClick={this.handleRetry}
            className="px-4 py-2 bg-red-600 dark:bg-[#f07178] text-white rounded-lg hover:bg-red-700 dark:hover:bg-[#ff5370] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 transition-colors text-sm font-medium"
          >
            Reintentar
          </button>
        </div>
      )
    }
    return <div key={this.state.attempt} className="contents">{this.props.children}</div>
  }
}