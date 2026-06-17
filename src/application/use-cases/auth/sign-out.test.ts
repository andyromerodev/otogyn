import { describe, expect, it, vi } from 'vitest'
import { SignOutUseCase } from './sign-out'
import type { AuthRepository } from '../../../domain/repositories/auth-repository'

describe('SignOutUseCase', () => {
  it('delegates sign out to the repository', async () => {
    const authRepository: AuthRepository = {
      signIn: vi.fn(),
      signUp: vi.fn(),
      getCurrentSession: vi.fn(),
      getAccessStatus: vi.fn(),
      signOut: vi.fn().mockResolvedValue(undefined),
    }

    const useCase = new SignOutUseCase(authRepository)

    await expect(useCase.execute()).resolves.toBeUndefined()
    expect(authRepository.signOut).toHaveBeenCalledTimes(1)
  })
})
