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
