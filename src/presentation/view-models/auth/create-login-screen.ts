import { computed, reactive, ref } from 'vue'
import type { AuthAccessReason, SignInInput } from '../../../application/dto/auth'

const normalizeRedirectTo = (redirectTo: string) => {
  if (!redirectTo.startsWith('/') || redirectTo.startsWith('//') || redirectTo.startsWith('/login')) {
    return '/dashboard'
  }

  return redirectTo
}

export interface LoginScreenPort<TInput> {
  execute(input: TInput): Promise<{ success: true } | { success: false; error: string }>
}

export interface LoginScreenDependencies {
  signInUseCase: LoginScreenPort<SignInInput>
  getAccessStatusUseCase: {
    execute(): Promise<{ allowed: boolean; reason?: AuthAccessReason }>
  }
  signOutUseCase: {
    execute(): Promise<void>
  }
  navigate: (to: string) => unknown | Promise<unknown>
  resolveRedirectTo: () => string
  resolveLoginReason: () => string | null
}

export const createLoginScreen = (dependencies: LoginScreenDependencies) => {
  const loginReason = dependencies.resolveLoginReason()
  const signInForm = reactive({
    email: '',
    password: '',
  })

  const errorMessage = ref<string | null>(
    loginReason === 'deactivated'
      ? 'Tu usuario fue desactivado. Contacta a la doctora administradora.'
      : null,
  )
  const pending = ref(false)

  const redirectTo = computed(() => normalizeRedirectTo(dependencies.resolveRedirectTo()))

  const applyRouteReason = async () => {
    if (loginReason !== 'deactivated') {
      return
    }

    try {
      await dependencies.signOutUseCase.execute()
    } catch {
      // The session may already be gone; the important part is preserving the UI message.
    }
  }

  const submitSignIn = async () => {
    errorMessage.value = null
    pending.value = true

    const result = await dependencies.signInUseCase.execute({
      email: signInForm.email,
      password: signInForm.password,
      callbackURL: redirectTo.value,
      rememberMe: true,
    })

    pending.value = false

    if (!result.success) {
      errorMessage.value = result.error
      return
    }

    const accessStatus = await dependencies.getAccessStatusUseCase.execute()

    if (!accessStatus.allowed) {
      if (accessStatus.reason === 'deactivated') {
        errorMessage.value = 'Tu usuario fue desactivado. Contacta a la doctora administradora.'

        try {
          await dependencies.signOutUseCase.execute()
        } catch {
          // Ignore sign-out cleanup errors and keep the deactivated message visible.
        }

        return
      }

      errorMessage.value = 'Tu usuario no tiene acceso a esta organizacion.'
      return
    }

    await dependencies.navigate(redirectTo.value)
  }

  return {
    applyRouteReason,
    signInForm,
    errorMessage,
    pending,
    redirectTo,
    submitSignIn,
  }
}
