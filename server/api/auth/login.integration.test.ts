import { fileURLToPath } from 'node:url'
import postgres from 'postgres'
import { afterAll, describe, expect, it } from 'vitest'
import { $fetch, fetch, setup } from '@nuxt/test-utils/e2e'

// Smoke real de login: levanta un servidor Nitro real contra la Neon branch
// de test (TEST_DATABASE_URL) y ejecuta signup -> signin -> ruta protegida
// contra el handler real de better-auth, sin mocks.
const TEST_PORT = 3010
const TEST_BASE_URL = `http://localhost:${TEST_PORT}`
const TEST_EMAIL = `test-login-${crypto.randomUUID()}@otogyn.test`
const TEST_PASSWORD = 'TestPassword123!'

await setup({
  rootDir: fileURLToPath(new URL('../../../', import.meta.url)),
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

describe('login (integration, HTTP real)', () => {
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

  it('permite crear cuenta, iniciar sesion y acceder a una ruta protegida', async () => {
    const signUpResponse = await fetch('/api/auth/sign-up/email', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'Test Login', email: TEST_EMAIL, password: TEST_PASSWORD }),
    })

    expect(signUpResponse.status).toBe(200)
    const signUpCookie = extractSessionCookie(signUpResponse.headers)

    const sessionContext = await $fetch('/api/auth/session-context', {
      headers: { cookie: signUpCookie },
    })

    expect(sessionContext).toHaveProperty('role')

    const signInResponse = await fetch('/api/auth/sign-in/email', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
    })

    expect(signInResponse.status).toBe(200)
    const signInCookie = extractSessionCookie(signInResponse.headers)

    const sessionAfterSignIn = await $fetch('/api/auth/session-context', {
      headers: { cookie: signInCookie },
    })

    expect(sessionAfterSignIn).toHaveProperty('role')
  })

  it('rechaza credenciales invalidas', async () => {
    const response = await fetch('/api/auth/sign-in/email', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: TEST_EMAIL, password: 'wrong-password' }),
    })

    expect(response.status).toBeGreaterThanOrEqual(400)
  })
})
