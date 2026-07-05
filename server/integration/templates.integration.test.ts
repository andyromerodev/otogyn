import { fileURLToPath } from 'node:url'
import postgres from 'postgres'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { fetch, setup } from '@nuxt/test-utils/e2e'

const TEST_PORT = 3013
const TEST_BASE_URL = `http://localhost:${TEST_PORT}`
const TEST_EMAIL = `test-templates-${crypto.randomUUID()}@otogyn.test`
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
    // WHO credentials no requeridas para estos tests
    WHO_ICD_CLIENT_ID: '',
    WHO_ICD_CLIENT_SECRET: '',
  },
})

const extractSessionCookie = (headers: Headers) => {
  const setCookie = headers.get('set-cookie')
  if (!setCookie) throw new Error('No set-cookie header from auth endpoint.')
  return setCookie.split(',').map((part) => part.split(';')[0]?.trim()).join('; ')
}

describe('treatment templates API (integration, HTTP real)', () => {
  let sessionCookie: string
  let createdTemplateId: string

  beforeAll(async () => {
    const signUpResponse = await fetch('/api/auth/sign-up/email', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Templates User',
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      }),
    })

    if (signUpResponse.status !== 200) {
      throw new Error(`Sign-up failed with status ${signUpResponse.status}`)
    }

    sessionCookie = extractSessionCookie(signUpResponse.headers)
  })

  afterAll(async () => {
    const sql = postgres(process.env.TEST_DATABASE_URL!, { prepare: false })
    await sql`DELETE FROM treatment_templates WHERE organization_id IN (SELECT id FROM organizations WHERE slug = 'otogyn')`
    await sql`DELETE FROM organization_members WHERE user_id IN (SELECT id FROM users WHERE email = ${TEST_EMAIL})`
    await sql`DELETE FROM profiles WHERE user_id IN (SELECT id FROM users WHERE email = ${TEST_EMAIL})`
    await sql`DELETE FROM accounts WHERE user_id IN (SELECT id FROM users WHERE email = ${TEST_EMAIL})`
    await sql`DELETE FROM sessions WHERE user_id IN (SELECT id FROM users WHERE email = ${TEST_EMAIL})`
    await sql`DELETE FROM users WHERE email = ${TEST_EMAIL}`
    await sql`DELETE FROM organizations WHERE slug = 'otogyn'`
    await sql.end()
  })

  it('GET /api/consultations/templates — 401 sin sesión', async () => {
    const response = await fetch('/api/consultations/templates')
    expect(response.status).toBe(401)
  })

  it('GET /api/consultations/templates — lista vacía para usuario nuevo', async () => {
    const res = await fetch('/api/consultations/templates', { headers: { cookie: sessionCookie } })
    const result = await res.json() as unknown[]
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBe(0)
  })

  it('POST /api/consultations/templates — crea una plantilla', async () => {
    const body = {
      name: 'Otitis media estándar',
      diagnosisCode: 'AB0Z',
      diagnosisLabel: 'Otitis media, sin especificación',
      treatmentPlan: 'Reposo, analgesia y seguimiento a 48h.',
      medications: [
        {
          name: 'Ibuprofeno',
          dose: '400mg',
          route: 'oral',
          frequency: 'c/8h',
          duration: '5 días',
          additionalInfo: '',
          isUsualMedication: false,
        },
      ],
      auxiliaryExams: ['Audiometría tonal'],
    }

    // Usamos fetch nativo para POST para evitar la inferencia recursiva de
    // tipos de Nuxt $fetch (TS2321 "Excessive stack depth") con body complejo.
    const res = await fetch('/api/consultations/templates', {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie: sessionCookie },
      body: JSON.stringify(body),
    })
    expect(res.status).toBe(200)
    const result = await res.json() as { id: string; name: string; diagnosisCode: string; medications: unknown[] }

    expect(result.id).toBeTruthy()
    expect(result.name).toBe('Otitis media estándar')
    expect(result.diagnosisCode).toBe('AB0Z')
    expect(result.medications).toHaveLength(1)

    createdTemplateId = result.id
  })

  it('GET /api/consultations/templates — devuelve la plantilla creada', async () => {
    const res = await fetch('/api/consultations/templates', { headers: { cookie: sessionCookie } })
    const result = await res.json() as Array<{ id: string; name: string }>

    expect(result).toHaveLength(1)
    expect(result[0]?.id).toBe(createdTemplateId)
    expect(result[0]?.name).toBe('Otitis media estándar')
  })

  it('GET /api/consultations/templates?diagnosisCode=AB0Z — filtra por código', async () => {
    // crear una segunda plantilla sin código de diagnóstico
    await fetch('/api/consultations/templates', {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie: sessionCookie },
      body: JSON.stringify({
        name: 'Plantilla genérica',
        treatmentPlan: 'Reposo.',
        medications: [],
        auxiliaryExams: [],
      }),
    })

    const res = await fetch('/api/consultations/templates?diagnosisCode=AB0Z', {
      headers: { cookie: sessionCookie },
    })
    const result = await res.json() as Array<{ diagnosisCode: string }>

    expect(result.length).toBeGreaterThanOrEqual(1)
    expect(result.every((t) => t.diagnosisCode === 'AB0Z')).toBe(true)
  })

  it('POST /api/consultations/templates — 401 sin sesión', async () => {
    const response = await fetch('/api/consultations/templates', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'x', treatmentPlan: 'x', medications: [], auxiliaryExams: [] }),
    })
    expect(response.status).toBe(401)
  })

  it('POST /api/consultations/templates — 400 si nombre vacío', async () => {
    const response = await fetch('/api/consultations/templates', {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie: sessionCookie },
      body: JSON.stringify({ name: '', treatmentPlan: 'x', medications: [], auxiliaryExams: [] }),
    })
    expect(response.status).toBe(400)
  })

  it('DELETE /api/consultations/templates/:id — elimina la plantilla', async () => {
    const response = await fetch(`/api/consultations/templates/${createdTemplateId}`, {
      method: 'DELETE',
      headers: { cookie: sessionCookie },
    })
    expect(response.status).toBe(200)

    // verificar que ya no aparece en la lista
    const listRes = await fetch('/api/consultations/templates', { headers: { cookie: sessionCookie } })
    const list = await listRes.json() as Array<{ id: string }>

    expect(list.every((t) => t.id !== createdTemplateId)).toBe(true)
  })

  it('DELETE /api/consultations/templates/:id — 400 si la plantilla no existe', async () => {
    const response = await fetch(`/api/consultations/templates/${crypto.randomUUID()}`, {
      method: 'DELETE',
      headers: { cookie: sessionCookie },
    })
    expect(response.status).toBe(400)
  })

  it('DELETE /api/consultations/templates/:id — 401 sin sesión', async () => {
    const response = await fetch(`/api/consultations/templates/${createdTemplateId}`, {
      method: 'DELETE',
    })
    expect(response.status).toBe(401)
  })
})
