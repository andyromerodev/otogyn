import { describe, expect, it, vi } from 'vitest'
import { SignInUseCase } from './sign-in'
import type { AuthRepository } from '../../../domain/repositories/auth-repository'

describe('SignInUseCase', () => {
  it('returns success when the repository signs in correctly', async () => {
    const repository: AuthRepository = {
      signIn: vi.fn().mockResolvedValue({ success: true, data: null }),
      signUp: vi.fn(),
      getCurrentSession: vi.fn(),
    }

    const useCase = new SignInUseCase(repository)
    const result = await useCase.execute({
      email: 'ana@otogyn.test',
      password: 'secret123',
      callbackURL: '/dashboard',
      rememberMe: true,
    })

    expect(result).toEqual({ success: true, data: null })
    expect(repository.signIn).toHaveBeenCalledOnce()
  })

  it('returns a controlled error when the repository fails', async () => {
    const repository: AuthRepository = {
      signIn: vi.fn().mockResolvedValue({ success: false, error: 'Credenciales invalidas.' }),
      signUp: vi.fn(),
      getCurrentSession: vi.fn(),
    }

    const useCase = new SignInUseCase(repository)
    const result = await useCase.execute({
      email: 'ana@otogyn.test',
      password: 'bad-password',
      callbackURL: '/dashboard',
      rememberMe: true,
    })

    expect(result).toEqual({ success: false, error: 'Credenciales invalidas.' })
  })
})
