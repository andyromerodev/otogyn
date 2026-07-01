import { createSignupViewModel } from '~~/src/presentation/view-models/auth/signup-view-model'
import { useAuthServices } from '../authServiceLocator'
import { navigateAfterAuth } from '../navigateAfterAuth'

export const useSignupViewModel = () => {
  const { signUpUseCase } = useAuthServices()

  return createSignupViewModel({
    signUpUseCase,
    navigate: navigateAfterAuth,
  })
}
