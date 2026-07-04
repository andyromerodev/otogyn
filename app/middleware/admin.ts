import { buildLoginRedirect, resolveSessionContext } from '~/utils/auth/session-context'
import { useSessionContext } from '~/composables/auth/use-session-context'

export default defineNuxtRouteMiddleware(async (to) => {
  const config = useRuntimeConfig()

  if (!config.public.authEnabled) {
    return
  }

  const session = useSessionContext()

  if (import.meta.server) {
    const sessionContext = await resolveSessionContext(useRequestHeaders(['cookie']))

    if (sessionContext === 'deactivated') {
      return navigateTo(buildLoginRedirect(to.fullPath, 'deactivated'))
    }

    if (!sessionContext?.role) {
      return navigateTo(buildLoginRedirect(to.fullPath))
    }

    if (sessionContext.role !== 'admin_doctor') {
      return navigateTo('/dashboard')
    }

    session.setSessionContext(sessionContext)
    return
  }

  // Cliente: decide con el rol cacheado; solo consulta a la red si el
  // estado está vacío (arranque frío sin payload SSR).
  if (!session.sessionContext.value) {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return navigateTo('/dashboard')
    }

    await session.refresh(to.fullPath)
  }

  const role = session.sessionContext.value?.role

  if (!role) {
    return navigateTo(buildLoginRedirect(to.fullPath))
  }

  if (role !== 'admin_doctor') {
    return navigateTo('/dashboard')
  }
})
