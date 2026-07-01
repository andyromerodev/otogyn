import { describe, expect, it, vi } from 'vitest'
import { createLoginViewModel } from './login-view-model'

describe('createLoginViewModel', () => {
  it('sets pending and navigates to redirect after a successful sign in', async () => {
    const navigate = vi.fn().mockResolvedValue(undefined)
    const getAccessStatusUseCase = {
      execute: vi.fn().mockResolvedValue({ allowed: true }),
    }
    const signInUseCase = {
      execute: vi.fn().mockImplementation(async () => {
        expect(screen.pending.value).toBe(true)
        return { success: true as const, data: null }
      }),
    }

    const screen = createLoginViewModel({
      getAccessStatusUseCase,
      signInUseCase,
      signOutUseCase: {
        execute: vi.fn().mockResolvedValue(undefined),
      },
      navigate,
      resolveRedirectTo: () => '/dashboard',
      resolveLoginReason: () => null,
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
    expect(getAccessStatusUseCase.execute).toHaveBeenCalledTimes(1)
    expect(navigate).toHaveBeenCalledWith('/dashboard')
  })

  it('shows the error message and clears previous success after a failed sign in', async () => {
    const screen = createLoginViewModel({
      getAccessStatusUseCase: {
        execute: vi.fn().mockResolvedValue({ allowed: true }),
      },
      signInUseCase: {
        execute: vi.fn().mockResolvedValue({ success: false, error: 'Credenciales invalidas.' }),
      },
      signOutUseCase: {
        execute: vi.fn().mockResolvedValue(undefined),
      },
      navigate: vi.fn().mockResolvedValue(undefined),
      resolveRedirectTo: () => '/dashboard',
      resolveLoginReason: () => null,
    })

    screen.signInForm.email = 'ana@otogyn.test'
    screen.signInForm.password = 'bad-password'

    await screen.submitSignIn()

    expect(screen.errorMessage.value).toBe('Credenciales invalidas.')
  })

  it('blocks navigation and signs out when the account is deactivated after sign in', async () => {
    const navigate = vi.fn().mockResolvedValue(undefined)
    const signOutUseCase = {
      execute: vi.fn().mockResolvedValue(undefined),
    }

    const screen = createLoginViewModel({
      getAccessStatusUseCase: {
        execute: vi.fn().mockResolvedValue({ allowed: false, reason: 'deactivated' }),
      },
      signInUseCase: {
        execute: vi.fn().mockResolvedValue({ success: true, data: null }),
      },
      signOutUseCase,
      navigate,
      resolveRedirectTo: () => '/dashboard',
      resolveLoginReason: () => null,
    })

    screen.signInForm.email = 'assistant@otogyn.test'
    screen.signInForm.password = 'secret123'

    await screen.submitSignIn()

    expect(signOutUseCase.execute).toHaveBeenCalledTimes(1)
    expect(screen.errorMessage.value).toBe('Tu usuario fue desactivado. Contacta a la doctora administradora.')
    expect(navigate).not.toHaveBeenCalled()
  })

  it('shows the deactivated message from the route reason and clears the session', async () => {
    const signOutUseCase = {
      execute: vi.fn().mockResolvedValue(undefined),
    }

    const screen = createLoginViewModel({
      getAccessStatusUseCase: {
        execute: vi.fn().mockResolvedValue({ allowed: true }),
      },
      signInUseCase: {
        execute: vi.fn().mockResolvedValue({ success: true, data: null }),
      },
      signOutUseCase,
      navigate: vi.fn().mockResolvedValue(undefined),
      resolveRedirectTo: () => '/dashboard',
      resolveLoginReason: () => 'deactivated',
    })

    await screen.applyRouteReason()

    expect(signOutUseCase.execute).toHaveBeenCalledTimes(1)
    expect(screen.errorMessage.value).toBe('Tu usuario fue desactivado. Contacta a la doctora administradora.')
  })
})
