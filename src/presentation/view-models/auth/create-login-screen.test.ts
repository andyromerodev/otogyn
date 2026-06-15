import { describe, expect, it, vi } from 'vitest'
import { createLoginScreen } from './create-login-screen'

describe('createLoginScreen', () => {
  it('sets pending and navigates to redirect after a successful sign in', async () => {
    const navigate = vi.fn().mockResolvedValue(undefined)
    const signInUseCase = {
      execute: vi.fn().mockImplementation(async () => {
        expect(screen.pending.value).toBe(true)
        return { success: true as const, data: null }
      }),
    }

    const screen = createLoginScreen({
      signInUseCase,
      navigate,
      resolveRedirectTo: () => '/dashboard',
    })

    screen.signInForm.email = 'ana@otogyn.test'
    screen.signInForm.password = 'secret123'

    await screen.submitSignIn()

    expect(signInUseCase.execute).toHaveBeenCalledWith({
      email: 'ana@otogyn.test',
      password: 'secret123',
      callbackURL: '/dashboard',
      rememberMe: true,
    })
    expect(screen.pending.value).toBe(false)
    expect(screen.errorMessage.value).toBeNull()
    expect(navigate).toHaveBeenCalledWith('/dashboard')
  })

  it('shows the error message and clears previous success after a failed sign in', async () => {
    const screen = createLoginScreen({
      signInUseCase: {
        execute: vi.fn().mockResolvedValue({ success: false, error: 'Credenciales invalidas.' }),
      },
      navigate: vi.fn().mockResolvedValue(undefined),
      resolveRedirectTo: () => '/dashboard',
    })

    screen.signInForm.email = 'ana@otogyn.test'
    screen.signInForm.password = 'bad-password'

    await screen.submitSignIn()

    expect(screen.errorMessage.value).toBe('Credenciales invalidas.')
  })
})
