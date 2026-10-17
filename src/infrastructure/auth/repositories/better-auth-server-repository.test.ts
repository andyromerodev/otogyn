import { describe, expect, it, vi } from 'vitest'
import { BetterAuthServerRepository } from './better-auth-server-repository'

vi.mock('../../runtime/build-target', () => ({
  IS_CLOUDFLARE_BUILD: false,
}))

vi.mock('../better-auth', () => ({
  getBetterAuth: () => null,
  getOrganizationMembershipForUser: vi.fn(),
  isBetterAuthEnabled: () => false,
}))

describe('BetterAuthServerRepository outside Cloudflare', () => {
  it('keeps the demo session when authentication is not configured', async () => {
    const repository = new BetterAuthServerRepository()

    await expect(repository.resolveSession({ headers: {} })).resolves.toMatchObject({
      organizationId: expect.any(String),
    })
  })
})
