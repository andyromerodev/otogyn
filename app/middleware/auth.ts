import { useAuthClient } from '~/utils/auth-client'

const getAuthErrorStatus = (error: unknown) => {
  if (
    error &&
    typeof error === 'object' &&
    'statusCode' in error &&
    typeof error.statusCode === 'number'
  ) {
    return {
      statusCode: error.statusCode,
      statusMessage:
        'statusMessage' in error && typeof error.statusMessage === 'string'
          ? error.statusMessage
          : undefined,
    }
  }

  return {
    statusCode: 500,
    statusMessage: undefined,
  }
}

const buildLoginRedirect = (path: string, reason?: 'deactivated') => ({
  path: '/login',
  query: {
    redirect: path,
    ...(reason ? { reason } : {}),
  },
})

export default defineNuxtRouteMiddleware(async (to) => {
  const config = useRuntimeConfig()

  if (!config.public.authEnabled) {
    return
  }

  if (import.meta.server) {
    const sessionContext = await $fetch('/api/auth/session-context', {
      headers: useRequestHeaders(['cookie']),
    }).catch((error) => {
      const { statusCode, statusMessage } = getAuthErrorStatus(error)

      console.error('[auth][middleware] server session check failed', {
        path: to.fullPath,
        statusCode,
        statusMessage,
        error: error instanceof Error ? error.message : 'Unknown session error',
      })

      if (statusCode === 401) {
        return null
      }

      if (statusCode === 403 && statusMessage === 'User account is deactivated.') {
        return 'deactivated' as const
      }

      if (statusCode === 403) {
        return null
      }

      return null
    })

    if (sessionContext === 'deactivated') {
      return navigateTo(buildLoginRedirect(to.fullPath, 'deactivated'))
    }

    if (!sessionContext) {
      return navigateTo(buildLoginRedirect(to.fullPath))
    }

    return
  }

  const authClient = useAuthClient()
  const sessionContext = await $fetch('/api/auth/session-context').catch(async (error) => {
    const { statusCode, statusMessage } = getAuthErrorStatus(error)

    if (statusCode === 403 && statusMessage === 'User account is deactivated.') {
      await authClient.signOut()
      return 'deactivated' as const
    }

    if (statusCode === 401 || statusCode === 403) {
      return null
    }

    throw error
  })

  if (sessionContext === 'deactivated') {
    return navigateTo(buildLoginRedirect(to.fullPath, 'deactivated'))
  }

  if (!sessionContext) {
    return navigateTo(buildLoginRedirect(to.fullPath))
  }
})
