import { useAuthClient } from '~/utils/auth-client'

export default defineNuxtRouteMiddleware(async (to) => {
  const config = useRuntimeConfig()

  if (!config.public.authEnabled) {
    return
  }

  if (import.meta.server) {
    const session = await $fetch<{ user?: unknown } | null>('/api/auth/get-session', {
      headers: useRequestHeaders(['cookie']),
    }).catch((error) => {
      console.error('[auth][middleware] server session check failed', {
        path: to.fullPath,
        error: error instanceof Error ? error.message : 'Unknown session error',
      })

      return null
    })

    if (!session?.user) {
      return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
    }

    return
  }

  const authClient = useAuthClient()
  const { data: session } = await authClient.useSession(useFetch)

  if (!session.value?.user) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  }
})
