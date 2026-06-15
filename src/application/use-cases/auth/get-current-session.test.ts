import { describe, expect, it, vi } from 'vitest'
import { GetCurrentSessionUseCase } from './get-current-session'
import type { AuthRepository } from '../../../domain/repositories/auth-repository'

describe('GetCurrentSessionUseCase', () => {
  it('returns the normalized session from the repository', async () => {
    const repository: AuthRepository = {
      signIn: vi.fn(),
      signUp: vi.fn(),
      getCurrentSession: vi.fn().mockResolvedValue({
        userId: 'user_1',
        email: 'ana@otogyn.test',
        name: 'Dra. Ana Garcia',
      }),
    }

    const useCase = new GetCurrentSessionUseCase(repository)
    const result = await useCase.execute()

    expect(result).toEqual({
      userId: 'user_1',
      email: 'ana@otogyn.test',
      name: 'Dra. Ana Garcia',
    })
  })

  it('returns null when there is no session', async () => {
    const repository: AuthRepository = {
      signIn: vi.fn(),
      signUp: vi.fn(),
      getCurrentSession: vi.fn().mockResolvedValue(null),
    }

    const useCase = new GetCurrentSessionUseCase(repository)
    const result = await useCase.execute()

    expect(result).toBeNull()
  })
})
