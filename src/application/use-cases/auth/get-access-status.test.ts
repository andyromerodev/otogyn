import { describe, expect, it, vi } from 'vitest'
import { GetAccessStatusUseCase } from './get-access-status'
import type { AuthRepository } from '../../../domain/repositories/auth-repository'

describe('GetAccessStatusUseCase', () => {
  it('returns the access status from the repository', async () => {
    const authRepository: AuthRepository = {
      signIn: vi.fn(),
      signUp: vi.fn(),
      getCurrentSession: vi.fn(),
      getAccessStatus: vi.fn().mockResolvedValue({ allowed: false, reason: 'deactivated' }),
      signOut: vi.fn(),
    }

    const useCase = new GetAccessStatusUseCase(authRepository)

    await expect(useCase.execute()).resolves.toEqual({ allowed: false, reason: 'deactivated' })
  })
})
