import type { PgDatabase } from 'drizzle-orm/pg-core'
import { drizzle } from 'drizzle-orm/postgres-js'
import type { PostgresJsQueryResultHKT } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { getRequestScope, type RequestScope } from '../../runtime/request-scope'

// Tipo base comun a la conexion normal y a un `tx` de transaccion (PgTransaction
// extiende PgDatabase), asi los repositorios aceptan cualquiera de los dos.
export type DrizzleClient = PgDatabase<PostgresJsQueryResultHKT>

export interface DrizzleConnection {
  db: DrizzleClient
  end: () => Promise<void>
}

export interface DrizzleConnectionOptions {
  prepare: boolean
  max?: number
}

interface HyperdriveBinding {
  connectionString?: string
}

// Fabrica sin estado: cada llamada abre su propio cliente postgres.js.
export const createDrizzleClient = (
  connectionString: string,
  options: DrizzleConnectionOptions,
): DrizzleConnection => {
  const connection = postgres(connectionString, {
    prepare: options.prepare,
    ...(options.max === undefined ? {} : { max: options.max }),
  })

  return {
    db: drizzle(connection),
    end: () => connection.end(),
  }
}

const REQUEST_DB_KEY = 'drizzle'

let dbInstance: DrizzleClient | null = null

const resolveRequestConnectionString = (scope: RequestScope): string | undefined => {
  const hyperdrive = scope.env.HYPERDRIVE as HyperdriveBinding | undefined

  return hyperdrive?.connectionString || process.env.DATABASE_URL || undefined
}

// Workers: un cliente por request (Hyperdrive). No se guarda en module scope porque
// las conexiones de un request no pueden usarse desde otro.
const getRequestDrizzleClient = (scope: RequestScope): DrizzleClient => {
  const cached = scope.cache.get(REQUEST_DB_KEY) as DrizzleClient | undefined

  if (cached) {
    return cached
  }

  const connectionString = resolveRequestConnectionString(scope)

  if (!connectionString) {
    throw new Error('DATABASE_URL no esta configurado.')
  }

  const { db, end } = createDrizzleClient(connectionString, { prepare: true, max: 5 })

  scope.cache.set(REQUEST_DB_KEY, db)
  scope.onRequestEnd(end)

  return db
}

// Node (Netlify, nuxt dev, tests, drizzle-kit): singleton de siempre.
const getSingletonDrizzleClient = (): DrizzleClient => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL no esta configurado.')
  }

  if (!dbInstance) {
    dbInstance = createDrizzleClient(process.env.DATABASE_URL, { prepare: false }).db
  }

  return dbInstance
}

// Indica si hay una conexion configurada, sin abrirla. Usado por la autenticacion.
export const hasDatabaseConnection = (): boolean => {
  const scope = getRequestScope()

  if (scope) {
    return Boolean(resolveRequestConnectionString(scope))
  }

  return Boolean(process.env.DATABASE_URL)
}

export const getDrizzleClient = (): DrizzleClient => {
  const scope = getRequestScope()

  return scope ? getRequestDrizzleClient(scope) : getSingletonDrizzleClient()
}
