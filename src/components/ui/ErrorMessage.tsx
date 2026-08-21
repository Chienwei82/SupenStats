interface ErrorMessageProps {
  message: string
  onRetry?: () => void
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="p-6 bg-red-50 rounded-xl border border-red-200 text-center">
      <div className="text-red-500 text-4xl mb-3">!</div>
      <p className="text-red-700 font-medium mb-1">Error al conectar con la API de SUPEN</p>
      <p className="text-red-500 text-sm mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
        >
          Reintentar
        </button>
      )}
    </div>
  )
}
