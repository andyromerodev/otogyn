import { createAuthClient } from 'better-auth/vue'

let authClient: ReturnType<typeof createAuthClient> | null = null

export type BetterAuthClient = ReturnType<typeof createAuthClient>

export const getBetterAuthClient = (baseURL: string): BetterAuthClient => {
  if (authClient) {
    return authClient
  }

  authClient = createAuthClient({
    baseURL,
  })

  return authClient
}
