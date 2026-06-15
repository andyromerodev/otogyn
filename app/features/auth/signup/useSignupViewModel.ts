import { createSignupScreen } from '~~/src/presentation/view-models/auth/create-signup-screen'
import { useAuthServices } from '../authServiceLocator'
import { navigateAfterAuth } from '../navigateAfterAuth'

export const useSignupViewModel = () => {
  const { signUpUseCase } = useAuthServices()

  return createSignupScreen({
    signUpUseCase,
    navigate: navigateAfterAuth,
  })
}
