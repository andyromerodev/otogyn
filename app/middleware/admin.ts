import { buildLoginRedirect, resolveSessionContext } from '~/utils/auth/session-context'

export default defineNuxtRouteMiddleware(async (to) => {
  const config = useRuntimeConfig()

  if (!config.public.authEnabled) {
    return
  }

  const sessionContext = await resolveSessionContext(
    import.meta.server ? useRequestHeaders(['cookie']) : undefined,
  )

  if (sessionContext === 'deactivated') {
    return navigateTo(buildLoginRedirect(to.fullPath, 'deactivated'))
  }

  if (!sessionContext?.role) {
    return navigateTo(buildLoginRedirect(to.fullPath))
  }

  if (sessionContext.role !== 'admin_doctor') {
    return navigateTo('/dashboard')
  }
})
