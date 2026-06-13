import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

let dbInstance: ReturnType<typeof drizzle> | null = null

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
