import {
  registerRequestScopeResolver,
  type RequestScope,
} from '../../src/infrastructure/runtime/request-scope'

// Adaptador de Nitro para el puerto de ambito de request. Solo hay ambito cuando el
// evento trae contexto de Cloudflare; en Node devuelve null y no cambia nada.
type ScopeHandle = RequestScope & { finish: () => Promise<void> }

const SCOPE_CONTEXT_KEY = 'requestScope'

const readCurrentEvent = () => {
  try {
    return useEvent()
  } catch {
    return null
  }
}

const createScope = (event: ReturnType<typeof useEvent>): ScopeHandle => {
  const cleanups: Array<() => unknown> = []

  return {
    env: event.context.cloudflare?.env ?? {},
    cache: new Map(),
    waitUntil: (promise) => {
      event.waitUntil(promise)
    },
    onRequestEnd: (cleanup) => {
      cleanups.push(cleanup)
    },
    finish: async () => {
      await Promise.allSettled(cleanups.map((cleanup) => Promise.resolve().then(cleanup)))
    },
  }
}

export default defineNitroPlugin((nitroApp) => {
  registerRequestScopeResolver(() => {
    const event = readCurrentEvent()

    if (!event?.context.cloudflare) {
      return null
    }

    event.context[SCOPE_CONTEXT_KEY] ??= createScope(event)

    return event.context[SCOPE_CONTEXT_KEY] as ScopeHandle
  })

  nitroApp.hooks.hook('afterResponse', (event) => {
    const scope = event.context[SCOPE_CONTEXT_KEY] as ScopeHandle | undefined

    if (scope) {
      // Cierra clientes con waitUntil: la respuesta ya salio, pero el worker sigue vivo.
      event.waitUntil(scope.finish())
    }
  })
})
