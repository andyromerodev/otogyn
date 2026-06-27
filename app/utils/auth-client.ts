import { getBetterAuthClient } from '~~/src/infrastructure/auth/client/better-auth-client'

export const useAuthClient = () => {
  return getBetterAuthClient()
}
