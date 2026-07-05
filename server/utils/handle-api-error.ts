import { ZodError } from 'zod'
import { BusinessRuleError } from '../../src/domain/errors/business-rule-error'

export const handleApiError = (error: unknown) => {
  if (
    error &&
    typeof error === 'object' &&
    'statusCode' in error &&
    typeof error.statusCode === 'number'
  ) {
    throw error
  }

  if (error instanceof BusinessRuleError) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message,
    })
  }

  if (error instanceof ZodError) {
    const firstIssue = error.issues[0]
    const field = firstIssue?.path.join('.') || 'campo'
    const message = firstIssue?.message ?? 'Validation failed.'
    throw createError({
      statusCode: 400,
      statusMessage: `${field}: ${message}`,
    })
  }

  throw createError({
    statusCode: 500,
    statusMessage: 'Unexpected server error.',
  })
}
