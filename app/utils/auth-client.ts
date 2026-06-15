import { getBetterAuthClient } from '~~/src/infrastructure/auth/client/better-auth-client'

export const useAuthClient = () => {
  const config = useRuntimeConfig()

  return getBetterAuthClient(config.public.authBaseURL)
}
