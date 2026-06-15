import { computed, reactive, ref } from 'vue'
import type { SignInInput } from '../../../application/dto/auth'

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
  navigate: (to: string) => unknown | Promise<unknown>
  resolveRedirectTo: () => string
}

export const createLoginScreen = (dependencies: LoginScreenDependencies) => {
  const signInForm = reactive({
    email: '',
    password: '',
  })

  const errorMessage = ref<string | null>(null)
  const pending = ref(false)

  const redirectTo = computed(() => normalizeRedirectTo(dependencies.resolveRedirectTo()))

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

    await dependencies.navigate(redirectTo.value)
  }

  return {
    signInForm,
    errorMessage,
    pending,
    redirectTo,
    submitSignIn,
  }
}
