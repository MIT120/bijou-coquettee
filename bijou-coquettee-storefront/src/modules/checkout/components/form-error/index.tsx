import { Text } from "@medusajs/ui"

type FormErrorProps = {
  error?: string | null
  className?: string
}

const FormError = ({ error, className = "" }: FormErrorProps) => {
  if (!error) return null

  return (
    <div
      className={`bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2 ${className}`}
      role="alert"
    >
      <svg
        className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clipRule="evenodd"
        />
      </svg>
      <Text className="text-red-800 text-sm flex-1">{error}</Text>
    </div>
  )
}

export default FormError
