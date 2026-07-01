import type { SignUpInput } from '~~/src/application/dto/auth'
import type { LoginViewModelPort } from './login-view-model.module'

// Equivale al módulo de Koin donde declaras viewModel { SignupViewModel(get(), get()) }
// Define todo lo que el ViewModel necesita que le sea inyectado desde afuera
export interface SignupViewModelDependencies {
  // Reutiliza LoginViewModelPort ya que el contrato de operación es el mismo (execute → Result)
  signUpUseCase: LoginViewModelPort<SignUpInput>
  navigate: (to: string) => unknown | Promise<unknown>
}
