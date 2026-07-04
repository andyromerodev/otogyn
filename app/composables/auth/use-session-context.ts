import type { AppSessionContext } from '~/utils/auth/session-context'
import { buildLoginRedirect, resolveSessionContext } from '~/utils/auth/session-context'
import { useAuthClient } from '~/utils/auth-client'
import { clearPwaCaches } from '~/utils/pwa-cache'

// Throttle de revalidación de sesión en background (~1 min).
// Evita múltiples requests al cambiar de tabs en el bottom nav.
const REVALIDATE_INTERVAL_MS = 60_000

interface SessionContextState {
  context: AppSessionContext | null
  // Epoch ms de la última validación exitosa contra el servidor.
  validatedAt: number | null
}

export const useSessionContext = () => {
  const state = useState<SessionContextState>('session-context', () => ({
    context: null,
    validatedAt: null,
  }))

  const sessionContext = computed(() => state.value.context)

  const setSessionContext = (context: AppSessionContext | null) => {
    state.value = { context, validatedAt: Date.now() }
  }

  const handleInvalidSession = async (currentPath: string, deactivated: boolean) => {
    state.value = { context: null, validatedAt: Date.now() }

    if (deactivated) {
      await useAuthClient().signOut()
      await clearPwaCaches()
    }

    await navigateTo(buildLoginRedirect(currentPath, deactivated ? 'deactivated' : undefined))
  }

  // Valida la sesión contra el servidor y actualiza el estado compartido.
  // Offline (error de red) conserva el estado cacheado: las API routes siguen
  // protegidas del lado del servidor, así que la UI puede seguir navegando.
  const refresh = async (currentPath: string): Promise<void> => {
    let result: AppSessionContext | null | 'deactivated'

    try {
      result = await resolveSessionContext()
    } catch {
      return
    }

    if (result === 'deactivated' || !result) {
      await handleInvalidSession(currentPath, result === 'deactivated')
      return
    }

    setSessionContext(result)
  }

  const shouldRevalidate = () => {
    const { validatedAt } = state.value
    return validatedAt === null || Date.now() - validatedAt > REVALIDATE_INTERVAL_MS
  }

  return {
    sessionContext,
    setSessionContext,
    refresh,
    shouldRevalidate,
  }
}
