import { describe, expect, it, vi } from 'vitest'
import { SignUpUseCase } from './sign-up'
import type { AuthRepository } from '../../../domain/repositories/auth-repository'

describe('SignUpUseCase', () => {
  it('returns success when the repository creates the user', async () => {
    const repository: AuthRepository = {
      signIn: vi.fn(),
      signUp: vi.fn().mockResolvedValue({ success: true, data: null }),
      getCurrentSession: vi.fn(),
    }

    const useCase = new SignUpUseCase(repository)
    const result = await useCase.execute({
      name: 'Dra. Ana Garcia',
      email: 'ana@otogyn.test',
      password: 'secret123',
    })

    expect(result).toEqual({ success: true, data: null })
    expect(repository.signUp).toHaveBeenCalledOnce()
  })

  it('returns a controlled error when the repository rejects the signup', async () => {
    const repository: AuthRepository = {
      signIn: vi.fn(),
      signUp: vi.fn().mockResolvedValue({ success: false, error: 'No se pudo crear la cuenta.' }),
      getCurrentSession: vi.fn(),
    }

    const useCase = new SignUpUseCase(repository)
    const result = await useCase.execute({
      name: 'Dra. Ana Garcia',
      email: 'ana@otogyn.test',
      password: 'short',
    })

    expect(result).toEqual({ success: false, error: 'No se pudo crear la cuenta.' })
  })
})
