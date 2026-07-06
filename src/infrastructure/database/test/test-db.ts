import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import type { DrizzleClient } from '../drizzle/client'

const getTestDatabaseUrl = () => {
  const url = process.env.TEST_DATABASE_URL

  if (!url) {
    throw new Error(
      'TEST_DATABASE_URL no esta configurado. Los tests de integracion requieren una base ' +
        'de datos de prueba separada (Neon branch dedicada, schema-only, sin datos reales).',
    )
  }

  return url
}

let connection: ReturnType<typeof postgres> | null = null
let schemaPatched = false

const getTestConnection = () => {
  if (!connection) {
    connection = postgres(getTestDatabaseUrl(), { prepare: false })
  }

  return connection
}

class RollbackTestTransaction extends Error {}

/**
 * Corre `fn` dentro de una transaccion sobre la DB de test y siempre hace
 * ROLLBACK al final (exito o error), para que cada test quede aislado sin
 * dejar datos residuales en la branch de test compartida.
 */
export async function withTestTransaction<T>(fn: (db: DrizzleClient) => Promise<T>): Promise<T> {
  const db = drizzle(getTestConnection())
  let result: T | undefined

  if (!schemaPatched) {
    await getTestConnection()`ALTER TABLE appointments ADD COLUMN IF NOT EXISTS agreed_price numeric(10, 2);`
    schemaPatched = true
  }

  try {
    await db.transaction(async (tx) => {
      result = await fn(tx)
      throw new RollbackTestTransaction()
    })
  } catch (error) {
    if (!(error instanceof RollbackTestTransaction)) {
      throw error
    }
  }

  return result as T
}

export const closeTestConnection = async () => {
  await connection?.end()
  connection = null
}
