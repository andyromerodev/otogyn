import { describe, expect, it, vi } from 'vitest'
import { createSignupScreen } from './create-signup-screen'

describe('createSignupScreen', () => {
  it('shows success and navigates to dashboard after a successful sign up', async () => {
    const navigate = vi.fn().mockResolvedValue(undefined)
    const signUpUseCase = {
      execute: vi.fn().mockResolvedValue({ success: true, data: null }),
    }

    const screen = createSignupScreen({
      signUpUseCase,
      navigate,
    })

    screen.signUpForm.name = 'Dra. Ana Garcia'
    screen.signUpForm.email = 'ana@otogyn.test'
    screen.signUpForm.password = 'secret123'
    screen.signUpForm.confirmPassword = 'secret123'
    screen.signUpForm.acceptedTerms = true

    await screen.submitSignUp()

    expect(signUpUseCase.execute).toHaveBeenCalledWith({
      name: 'Dra. Ana Garcia',
      email: 'ana@otogyn.test',
      password: 'secret123',
    })
    expect(screen.pending.value).toBe(false)
    expect(screen.errorMessage.value).toBeNull()
    expect(screen.successMessage.value).toBe('Cuenta creada. Ya puedes entrar al dashboard.')
    expect(navigate).toHaveBeenCalledWith('/dashboard')
  })

  it('does not submit when passwords do not match', async () => {
    const signUpUseCase = {
      execute: vi.fn(),
    }

    const screen = createSignupScreen({
      signUpUseCase,
      navigate: vi.fn(),
    })

    screen.signUpForm.password = 'secret123'
    screen.signUpForm.confirmPassword = 'different'
    screen.signUpForm.acceptedTerms = true

    await screen.submitSignUp()

    expect(signUpUseCase.execute).not.toHaveBeenCalled()
    expect(screen.errorMessage.value).toBe('Las contrasenas no coinciden.')
  })

  it('does not submit when terms are not accepted', async () => {
    const signUpUseCase = {
      execute: vi.fn(),
    }

    const screen = createSignupScreen({
      signUpUseCase,
      navigate: vi.fn(),
    })

    screen.signUpForm.password = 'secret123'
    screen.signUpForm.confirmPassword = 'secret123'
    screen.signUpForm.acceptedTerms = false

    await screen.submitSignUp()

    expect(signUpUseCase.execute).not.toHaveBeenCalled()
    expect(screen.errorMessage.value).toBe('Acepta los terminos y la politica de privacidad para continuar.')
  })
})
