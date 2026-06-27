export interface ServiceScreenPort<TInput, TResult> {
  execute(input: TInput): Promise<TResult>
}

export interface ServiceFormState {
  name: string
  description: string
  defaultDurationMinutes: number
  price: string
  isActive: boolean
}

export const normalizeServiceApiError = (error: unknown, fallback: string): string => {
  if (!error || typeof error !== 'object') {
    return fallback
  }

  if ('statusMessage' in error && typeof error.statusMessage === 'string' && error.statusMessage.length > 0) {
    return error.statusMessage
  }

  if (
    'data' in error &&
    error.data &&
    typeof error.data === 'object' &&
    'message' in error.data &&
    typeof error.data.message === 'string' &&
    error.data.message.length > 0
  ) {
    return error.data.message
  }

  if ('message' in error && typeof error.message === 'string' && error.message.length > 0) {
    return error.message
  }

  return fallback
}

export const createInitialServiceForm = (): ServiceFormState => ({
  name: '',
  description: '',
  defaultDurationMinutes: 30,
  price: '',
  isActive: true,
})

export const normalizeOptionalPrice = (value: string | number) => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null
  }

  const normalized = value.trim()

  if (!normalized) {
    return null
  }

  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}
