import { useAuthClient } from '~/utils/auth-client'
import { buildLoginRedirect, getAuthErrorStatus, resolveSessionContext } from '~/utils/auth/session-context'
import { clearPwaCaches } from '~/utils/pwa-cache'

export default defineNuxtRouteMiddleware(async (to) => {
  const config = useRuntimeConfig()

  if (!config.public.authEnabled) {
    return
  }

  if (import.meta.server) {
    const sessionContext = await resolveSessionContext(useRequestHeaders(['cookie'])).catch((error) => {
      const { statusCode, statusMessage } = getAuthErrorStatus(error)

      console.error('[auth][middleware] server session check failed', {
        path: to.fullPath,
        statusCode,
        statusMessage,
        error: error instanceof Error ? error.message : 'Unknown session error',
      })

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
  const sessionContext = await resolveSessionContext().catch((error) => {
    throw error
  })

  if (sessionContext === 'deactivated') {
    await authClient.signOut()
    await clearPwaCaches()
  }

  if (sessionContext === 'deactivated') {
    return navigateTo(buildLoginRedirect(to.fullPath, 'deactivated'))
  }

  if (!sessionContext) {
    return navigateTo(buildLoginRedirect(to.fullPath))
  }
})
