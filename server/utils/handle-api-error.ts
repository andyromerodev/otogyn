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
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed.',
      data: error.flatten(),
    })
  }

  throw createError({
    statusCode: 500,
    statusMessage: 'Unexpected server error.',
  })
}
