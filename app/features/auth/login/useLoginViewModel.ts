import { createLoginScreen } from '~~/src/presentation/view-models/auth/create-login-screen'
import { useAuthServices } from '../authServiceLocator'
import { navigateAfterAuth } from '../navigateAfterAuth'

export const useLoginViewModel = () => {
  const route = useRoute()
  const { signInUseCase } = useAuthServices()

  return createLoginScreen({
    signInUseCase,
    navigate: navigateAfterAuth,
    resolveRedirectTo: () => {
      const redirect = route.query.redirect
      return typeof redirect === 'string' && redirect.length > 0 ? redirect : '/dashboard'
    },
  })
}
