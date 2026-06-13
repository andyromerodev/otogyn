import { useAuthClient } from '~/utils/auth-client'

export default defineNuxtRouteMiddleware(async (to) => {
  const config = useRuntimeConfig()

  if (!config.public.authEnabled) {
    return
  }

  const authClient = useAuthClient()
  const { data: session } = await authClient.useSession(useFetch)

  if (!session.value) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  }
})
