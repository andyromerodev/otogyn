interface SessionContext {
  role?: 'admin_doctor' | 'assistant'
}

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

    if (statusCode === 401) {
      return null
    }

    if (statusCode === 403) {
      return { role: 'assistant' as const }
    }

    throw error
  })

  if (!sessionContext?.role) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  }

  if (sessionContext.role !== 'admin_doctor') {
    return navigateTo('/dashboard')
  }
})
