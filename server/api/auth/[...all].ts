import { toWebRequest } from 'h3'
import { getBetterAuth } from '~~/src/infrastructure/auth/better-auth'

export default defineEventHandler(async (event) => {
  const auth = getBetterAuth()

  if (!auth) {
    console.error('[auth][server] request rejected because auth is not configured', {
      path: event.path,
      method: event.method,
      hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
      hasAuthSecret: Boolean(process.env.AUTH_SECRET),
    })

    throw createError({
      statusCode: 503,
      statusMessage: 'Authentication is not configured.',
    })
  }

  try {
    return await auth.handler(toWebRequest(event))
  } catch (error) {
    console.error('[auth][server] request failed', {
      path: event.path,
      method: event.method,
      error: error instanceof Error ? error.message : 'Unknown auth handler error',
    })

    throw error
  }
})
