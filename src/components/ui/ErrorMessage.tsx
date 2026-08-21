interface ErrorMessageProps {
  message: string
  onRetry?: () => void
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="p-6 bg-red-50 rounded-xl border border-red-200 text-center" role="alert">
      <div className="text-red-500 text-4xl mb-3" aria-hidden="true">!</div>
      <p className="text-red-700 font-medium mb-1">Error al conectar con la API de SUPEN</p>
      <p className="text-red-500 text-sm mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 transition-colors text-sm font-medium"
        >
          Reintentar
        </button>
      )}
    </div>
  )
}
