import { reactive, ref } from 'vue'
import type { SignupViewModelDependencies } from './signup-view-model.module'

export type { SignupViewModelDependencies } from './signup-view-model.module'

// Factory del ViewModel — equivale al constructor de SignupViewModel : ViewModel()
export const createSignupViewModel = (dependencies: SignupViewModelDependencies) => {
  // Como MutableStateFlow<SignUpForm> — estado mutable del formulario,
  // ligado 2-way a los campos del template via v-model (equivale a onNameChanged / onEmailChanged / etc.)
  const signUpForm = reactive({
    name: '',
    professionalLicense: '',
    specialty: 'Otorrinolaringologia',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptedTerms: false,
  })

  // Como StateFlow<String?> — expuesto read-only a la UI;
  // solo el ViewModel lo muta internamente via .value (nunca desde el template)
  const errorMessage = ref<string | null>(null)

  // Como StateFlow<String?> — mensaje de éxito tras el registro, observado por la UI
  const successMessage = ref<string | null>(null)

  // Como StateFlow<Boolean> — la UI lo observa para deshabilitar el botón de submit
  const pending = ref(false)

  // Equivale a fun onSignUpClicked() en el ViewModel de Android — lanza la lógica de negocio
  // y actualiza los StateFlows según el resultado
  const submitSignUp = async () => {
    errorMessage.value = null
    successMessage.value = null

    if (signUpForm.password !== signUpForm.confirmPassword) {
      errorMessage.value = 'Las contrasenas no coinciden.'
      return
    }

    if (!signUpForm.acceptedTerms) {
      errorMessage.value = 'Acepta los terminos y la politica de privacidad para continuar.'
      return
    }

    pending.value = true

    const result = await dependencies.signUpUseCase.execute({
      name: signUpForm.name,
      email: signUpForm.email,
      password: signUpForm.password,
    })

    pending.value = false

    if (!result.success) {
      errorMessage.value = result.error
      return
    }

    successMessage.value = 'Cuenta creada. Ya puedes entrar al dashboard.'
    await dependencies.navigate('/dashboard')
  }

  return {
    signUpForm,
    errorMessage,
    successMessage,
    pending,
    submitSignUp,
  }
}
