import { describe, expect, it, vi } from 'vitest'
import { BetterAuthServerRepository } from './better-auth-server-repository'

vi.mock('../../runtime/build-target', () => ({
  IS_CLOUDFLARE_BUILD: true,
}))

vi.mock('../better-auth', () => ({
  getBetterAuth: () => null,
  getOrganizationMembershipForUser: vi.fn(),
  isBetterAuthEnabled: () => false,
}))

vi.stubGlobal('createError', (options: { statusCode: number; statusMessage: string }) =>
  Object.assign(new Error(options.statusMessage), options),
)

describe('BetterAuthServerRepository on the Cloudflare build', () => {
  it('refuses the demo session when authentication is not configured', async () => {
    const repository = new BetterAuthServerRepository()

    await expect(repository.resolveSession({ headers: {} })).rejects.toMatchObject({
      statusCode: 503,
    })
  })
})
