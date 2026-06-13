import { createAuthClient } from 'better-auth/vue'

let authClient: ReturnType<typeof createAuthClient> | null = null

export const useAuthClient = () => {
  if (authClient) {
    return authClient
  }

  const config = useRuntimeConfig()

  authClient = createAuthClient({
    baseURL: config.public.authBaseURL,
  })

  return authClient
}
