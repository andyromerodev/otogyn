import { reactive, ref } from 'vue'
import type { SignUpInput } from '../../../application/dto/auth'
import type { LoginScreenPort } from './create-login-screen'

export interface SignupScreenDependencies {
  signUpUseCase: LoginScreenPort<SignUpInput>
  navigate: (to: string) => unknown | Promise<unknown>
}

export const createSignupScreen = (dependencies: SignupScreenDependencies) => {
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

  const errorMessage = ref<string | null>(null)
  const successMessage = ref<string | null>(null)
  const pending = ref(false)

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
