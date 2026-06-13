import { toWebRequest } from 'h3'
import { getBetterAuth } from '../../../src/infrastructure/auth/better-auth'

export default defineEventHandler(async (event) => {
  const auth = getBetterAuth()

  if (!auth) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Authentication is not configured.',
    })
  }

  return auth.handler(toWebRequest(event))
})
