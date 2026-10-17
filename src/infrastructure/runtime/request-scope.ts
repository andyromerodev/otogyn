// Puerto del ambito de request. En Cloudflare Workers existe por request y expone los
// bindings (Hyperdrive, R2, rate limiters). En Node no existe: getRequestScope() devuelve
// null y los consumidores usan sus singletons de siempre.
export interface RequestScope {
  /** Bindings del runtime. Vacio fuera de Workers. */
  readonly env: Readonly<Record<string, unknown>>
  /** Valores creados durante este request. Se descartan al terminar. */
  readonly cache: Map<string, unknown>
  /** Mantiene el worker activo hasta que la promesa termine, sin retrasar la respuesta. */
  waitUntil(promise: Promise<unknown>): void
  /** Registra una limpieza que se ejecuta despues de enviar la respuesta. */
  onRequestEnd(cleanup: () => unknown): void
}

export type RequestScopeResolver = () => RequestScope | null

let resolveScope: RequestScopeResolver = () => null

// Lo registra el plugin de Nitro en server/plugins/request-scope.ts.
export const registerRequestScopeResolver = (resolver: RequestScopeResolver): void => {
  resolveScope = resolver
}

export const getRequestScope = (): RequestScope | null => resolveScope()
