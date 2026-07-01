import { fileURLToPath } from 'node:url'
import postgres from 'postgres'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { $fetch, fetch, setup } from '@nuxt/test-utils/e2e'

// Smoke tests HTTP reales de las rutas admin principales: confirma que, con
// una sesion valida, cada ruta responde 200 con la forma esperada (no un 401
// por permisos rotos ni un 500 por una regresion). No es cobertura exhaustiva
// de reglas de negocio, esas ya estan cubiertas por los tests unitarios y de
// integracion de cada UseCase.
const TEST_PORT = 3011
const TEST_BASE_URL = `http://localhost:${TEST_PORT}`
const TEST_EMAIL = `test-admin-smoke-${crypto.randomUUID()}@otogyn.test`
const TEST_PASSWORD = 'TestPassword123!'

await setup({
  rootDir: fileURLToPath(new URL('../../', import.meta.url)),
  dev: true,
  server: true,
  port: TEST_PORT,
  setupTimeout: 120_000,
  env: {
    NODE_ENV: 'test',
    DATABASE_URL: process.env.TEST_DATABASE_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_URL: TEST_BASE_URL,
  },
})

const extractSessionCookie = (headers: Headers) => {
  const setCookie = headers.get('set-cookie')
  if (!setCookie) throw new Error('El endpoint de auth no devolvio set-cookie.')

  return setCookie.split(',').map((part) => part.split(';')[0]?.trim()).join('; ')
}

describe('admin routes smoke test (integration, HTTP real)', () => {
  let sessionCookie: string

  beforeAll(async () => {
    const signUpResponse = await fetch('/api/auth/sign-up/email', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'Test Admin Smoke', email: TEST_EMAIL, password: TEST_PASSWORD }),
    })

    if (signUpResponse.status !== 200) {
      throw new Error(`No se pudo crear el usuario de prueba para el smoke test (status ${signUpResponse.status}).`)
    }

    sessionCookie = extractSessionCookie(signUpResponse.headers)
  })

  afterAll(async () => {
    const sql = postgres(process.env.TEST_DATABASE_URL!, { prepare: false })
    await sql`DELETE FROM organization_members WHERE user_id IN (SELECT id FROM users WHERE email = ${TEST_EMAIL})`
    await sql`DELETE FROM profiles WHERE user_id IN (SELECT id FROM users WHERE email = ${TEST_EMAIL})`
    await sql`DELETE FROM accounts WHERE user_id IN (SELECT id FROM users WHERE email = ${TEST_EMAIL})`
    await sql`DELETE FROM sessions WHERE user_id IN (SELECT id FROM users WHERE email = ${TEST_EMAIL})`
    await sql`DELETE FROM users WHERE email = ${TEST_EMAIL}`
    // Organizacion por defecto que better-auth bootstrapea en el primer signup
    // (ver getOrCreateDefaultOrganizationId en src/infrastructure/auth/better-auth.ts).
    // Se recrea sola en el siguiente signup, asi que es seguro borrarla aqui.
    await sql`DELETE FROM organizations WHERE slug = 'otogyn'`
    await sql.end()
  })

  it('GET /api/auth/session-context responde con el rol del usuario', async () => {
    const session = await $fetch('/api/auth/session-context', { headers: { cookie: sessionCookie } })
    expect(session).toHaveProperty('role')
    expect(session).toHaveProperty('organizationId')
  })

  it('GET /api/patients responde 200 con forma paginada', async () => {
    const result = await $fetch('/api/patients', { headers: { cookie: sessionCookie } })
    expect(result).toHaveProperty('items')
    expect(result).toHaveProperty('total')
    expect(Array.isArray((result as { items: unknown[] }).items)).toBe(true)
  })

  it('GET /api/services responde 200 con un arreglo', async () => {
    const result = await $fetch('/api/services', { headers: { cookie: sessionCookie } })
    expect(Array.isArray(result)).toBe(true)
  })

  it('GET /api/dashboard/summary responde 200', async () => {
    const result = await $fetch('/api/dashboard/summary', { headers: { cookie: sessionCookie } })
    expect(result).toBeDefined()
  })

  it('rechaza rutas admin sin sesion con 401', async () => {
    const response = await fetch('/api/patients')
    expect(response.status).toBe(401)
  })
})
