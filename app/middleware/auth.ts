import { buildLoginRedirect, getAuthErrorStatus, resolveSessionContext } from '~/utils/auth/session-context'
import { useSessionContext } from '~/composables/auth/use-session-context'

export default defineNuxtRouteMiddleware(async (to) => {
  const config = useRuntimeConfig()

  if (!config.public.authEnabled) {
    return
  }

  const session = useSessionContext()

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

    // Se serializa al payload SSR: el cliente arranca hidratado y las
    // navegaciones del bottom nav no vuelven a esperar a la red.
    session.setSessionContext(sessionContext)
    return
  }

  // Cliente: con sesión cacheada la navegación es instantánea y la
  // revalidación corre en background (throttled, sin await).
  if (session.sessionContext.value) {
    if (session.shouldRevalidate()) {
      void session.refresh(to.fullPath)
    }

    return
  }

  // Sin sesión cacheada y sin red: fail-open. La UI navega con lo que tenga
  // cacheado el service worker; las API routes siguen exigiendo sesión.
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return
  }

  await session.refresh(to.fullPath)

  if (!session.sessionContext.value) {
    return navigateTo(buildLoginRedirect(to.fullPath))
  }
})
