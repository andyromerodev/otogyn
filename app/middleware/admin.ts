interface SessionContext {
  role?: 'admin_doctor' | 'assistant'
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

  const sessionContext = await $fetch<SessionContext>('/api/auth/session-context', {
    headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined,
  }).catch((error) => {
    const statusCode =
      error &&
      typeof error === 'object' &&
      'statusCode' in error &&
      typeof error.statusCode === 'number'
        ? error.statusCode
        : 500
    const statusMessage =
      error &&
      typeof error === 'object' &&
      'statusMessage' in error &&
      typeof error.statusMessage === 'string'
        ? error.statusMessage
        : undefined

    if (statusCode === 401) {
      return null
    }

    if (statusCode === 403 && statusMessage === 'User account is deactivated.') {
      return 'deactivated' as const
    }

    if (statusCode === 403) {
      return { role: 'assistant' as const }
    }

    throw error
  })

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
