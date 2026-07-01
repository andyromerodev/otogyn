import type { AuthAccessReason, SignInInput } from '~~/src/application/dto/auth'

// Equivale a la interfaz del UseCase inyectado en el ViewModel de Android (ej. SignInUseCase)
// Se reutiliza en otros ViewModels de auth que comparten el mismo contrato de operación
export interface LoginViewModelPort<TInput> {
  execute(input: TInput): Promise<{ success: true } | { success: false; error: string }>
}

// Equivale al módulo de Koin donde declaras viewModel { LoginViewModel(get(), get(), get()) }
// Define todo lo que el ViewModel necesita que le sea inyectado desde afuera
export interface LoginViewModelDependencies {
  signInUseCase: LoginViewModelPort<SignInInput>
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
