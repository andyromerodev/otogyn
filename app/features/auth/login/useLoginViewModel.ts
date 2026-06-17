import { createLoginScreen } from '~~/src/presentation/view-models/auth/create-login-screen'
import { useAuthServices } from '../authServiceLocator'
import { navigateAfterAuth } from '../navigateAfterAuth'

export const useLoginViewModel = () => {
  const route = useRoute()
  const { getAccessStatusUseCase, signInUseCase, signOutUseCase } = useAuthServices()

  const screen = createLoginScreen({
    getAccessStatusUseCase,
    signInUseCase,
    signOutUseCase,
    navigate: navigateAfterAuth,
    resolveRedirectTo: () => {
      const redirect = route.query.redirect
      return typeof redirect === 'string' && redirect.length > 0 ? redirect : '/dashboard'
    },
    resolveLoginReason: () => {
      const reason = route.query.reason
      return typeof reason === 'string' && reason.length > 0 ? reason : null
    },
  })

  onMounted(() => {
    void screen.applyRouteReason()
  })

  return screen
}
