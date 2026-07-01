import { computed, reactive, ref } from 'vue'
import type { LoginViewModelDependencies } from './login-view-model.module'

export type { LoginViewModelPort, LoginViewModelDependencies } from './login-view-model.module'

const normalizeRedirectTo = (redirectTo: string) => {
  if (!redirectTo.startsWith('/') || redirectTo.startsWith('//') || redirectTo.startsWith('/login')) {
    return '/dashboard'
  }

  return redirectTo
}

// Factory del ViewModel — equivale al constructor de LoginViewModel : ViewModel()
export const createLoginViewModel = (dependencies: LoginViewModelDependencies) => {
  // val loginReason: String? — snapshot de query param leído una sola vez en el init,
  // equivale a savedStateHandle.get<String>("reason") en Android
  const loginReason = dependencies.resolveLoginReason()

  // Como MutableStateFlow<SignInForm> — estado mutable del formulario,
  // ligado 2-way a los campos del template via v-model (equivale a onEmailChanged / onPasswordChanged)
  const signInForm = reactive({
    email: '',
    password: '',
  })

  // Como StateFlow<String?> — expuesto read-only a la UI;
  // solo el ViewModel lo muta internamente via .value (nunca desde el template)
  const errorMessage = ref<string | null>(
    loginReason === 'deactivated'
      ? 'Tu usuario fue desactivado. Contacta a la doctora administradora.'
      : null,
  )

  // Como StateFlow<Boolean> — la UI lo observa para deshabilitar el botón de submit
  const pending = ref(false)

  // Como derivedStateOf { } o combine(routeStateFlow) — valor calculado y cacheado,
  // se recalcula automáticamente si cambia su fuente reactiva
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

  // Equivale a fun onSignInClicked() en el ViewModel de Android — lanza la lógica de negocio
  // y actualiza los StateFlows según el resultado
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
