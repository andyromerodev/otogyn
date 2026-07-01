import type { PgDatabase } from 'drizzle-orm/pg-core'
import { drizzle } from 'drizzle-orm/postgres-js'
import type { PostgresJsQueryResultHKT } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

// Tipo base comun a la conexion normal y a un `tx` de transaccion (PgTransaction
// extiende PgDatabase), asi los repositorios aceptan cualquiera de los dos.
export type DrizzleClient = PgDatabase<PostgresJsQueryResultHKT>

let dbInstance: DrizzleClient | null = null

export const getDrizzleClient = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL no esta configurado.')
  }

  if (!dbInstance) {
    const connection = postgres(process.env.DATABASE_URL, {
      prepare: false,
    })

    dbInstance = drizzle(connection)
  }

  return dbInstance
}
