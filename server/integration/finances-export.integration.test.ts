import { fileURLToPath } from 'node:url'
import postgres from 'postgres'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { fetch, setup } from '@nuxt/test-utils/e2e'

const TEST_PORT = 3014
const TEST_BASE_URL = `http://localhost:${TEST_PORT}`
const TEST_EMAIL = `test-finances-export-${crypto.randomUUID()}@otogyn.test`
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
  if (!setCookie) throw new Error('El endpoint de auth no devolvió set-cookie.')

  return setCookie.split(',').map((part) => part.split(';')[0]?.trim()).join('; ')
}

describe('finances export API (integration, HTTP real)', () => {
  let sessionCookie: string
  let categoryId: string

  beforeAll(async () => {
    const sql = postgres(process.env.TEST_DATABASE_URL!, { prepare: false })

    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method') THEN
          CREATE TYPE payment_method AS ENUM ('efectivo', 'tarjeta', 'transferencia');
        END IF;
      END
      $$;
    `

    await sql`
      CREATE TABLE IF NOT EXISTS payments (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        patient_id uuid,
        appointment_id uuid,
        consultation_id uuid,
        amount numeric(10, 2) NOT NULL,
        method payment_method NOT NULL,
        concept varchar(255) NOT NULL,
        paid_at timestamptz NOT NULL,
        notes text,
        created_by uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
    `

    await sql`
      CREATE TABLE IF NOT EXISTS expense_categories (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        name varchar(120) NOT NULL,
        is_active boolean NOT NULL DEFAULT true,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
    `

    await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS expense_categories_org_name_idx
      ON expense_categories (organization_id, name);
    `

    await sql`
      CREATE TABLE IF NOT EXISTS expenses (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        category_id uuid NOT NULL REFERENCES expense_categories(id) ON DELETE RESTRICT,
        amount numeric(10, 2) NOT NULL,
        description varchar(255) NOT NULL,
        expense_date timestamptz NOT NULL,
        notes text,
        created_by uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
    `

    const signUpResponse = await fetch('/api/auth/sign-up/email', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Finances Export',
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      }),
    })

    if (signUpResponse.status !== 200) {
      throw new Error(`No se pudo crear el usuario de prueba (status ${signUpResponse.status}).`)
    }

    sessionCookie = extractSessionCookie(signUpResponse.headers)

    await sql`
      UPDATE organization_members
      SET role = 'admin_doctor'
      WHERE user_id IN (SELECT id FROM users WHERE email = ${TEST_EMAIL})
    `

    const categoryResponse = await fetch('/api/expense-categories', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        cookie: sessionCookie,
      },
      body: JSON.stringify({ name: 'Insumos' }),
    })
    expect(categoryResponse.status).toBe(200)

    const category = await categoryResponse.json() as { id: string }
    categoryId = category.id

    const paymentResponse = await fetch('/api/payments', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        cookie: sessionCookie,
      },
      body: JSON.stringify({
        amount: 320,
        method: 'tarjeta',
        concept: 'Consulta inicial',
        paidAt: '2026-07-04T14:00:00.000Z',
        notes: 'Pago con POS',
      }),
    })
    expect(paymentResponse.status).toBe(200)

    const expenseResponse = await fetch('/api/expenses', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        cookie: sessionCookie,
      },
      body: JSON.stringify({
        categoryId,
        amount: 85,
        description: 'Compra de insumos',
        expenseDate: '2026-07-03T15:00:00.000Z',
        notes: 'Guantes y mascarillas',
      }),
    })
    expect(expenseResponse.status).toBe(200)

    await sql.end()
  })

  afterAll(async () => {
    const sql = postgres(process.env.TEST_DATABASE_URL!, { prepare: false })
    await sql`DELETE FROM expenses WHERE organization_id IN (SELECT id FROM organizations WHERE slug = 'otogyn')`
    await sql`DELETE FROM payments WHERE organization_id IN (SELECT id FROM organizations WHERE slug = 'otogyn')`
    await sql`DELETE FROM expense_categories WHERE organization_id IN (SELECT id FROM organizations WHERE slug = 'otogyn')`
    await sql`DELETE FROM organization_members WHERE user_id IN (SELECT id FROM users WHERE email = ${TEST_EMAIL})`
    await sql`DELETE FROM profiles WHERE user_id IN (SELECT id FROM users WHERE email = ${TEST_EMAIL})`
    await sql`DELETE FROM accounts WHERE user_id IN (SELECT id FROM users WHERE email = ${TEST_EMAIL})`
    await sql`DELETE FROM sessions WHERE user_id IN (SELECT id FROM users WHERE email = ${TEST_EMAIL})`
    await sql`DELETE FROM users WHERE email = ${TEST_EMAIL}`
    await sql`DELETE FROM organizations WHERE slug = 'otogyn'`
    await sql.end()
  })

  it('rechaza exportar sin sesión', async () => {
    const response = await fetch('/api/finances/export?type=payments')
    expect(response.status).toBe(401)
  })

  it('exporta pagos como CSV con BOM y attachment header', async () => {
    const response = await fetch('/api/finances/export?type=payments&method=tarjeta', {
      headers: { cookie: sessionCookie },
    })
    const bytes = new Uint8Array(await response.arrayBuffer())
    const body = new TextDecoder().decode(bytes)

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toContain('text/csv')
    expect(response.headers.get('content-disposition')).toContain('finanzas-pagos-')
    expect(Array.from(bytes.slice(0, 3))).toEqual([0xef, 0xbb, 0xbf])
    expect(body).toContain('Fecha,Paciente,Concepto,Método,Monto,Notas,Cita,Consulta')
    expect(body).toContain('Consulta inicial')
    expect(body).toContain('Tarjeta')
    expect(body).toContain('320.00')
  })

  it('exporta gastos como CSV con el filtro de categoría', async () => {
    const response = await fetch(`/api/finances/export?type=expenses&categoryId=${categoryId}`, {
      headers: { cookie: sessionCookie },
    })
    const bytes = new Uint8Array(await response.arrayBuffer())
    const body = new TextDecoder().decode(bytes)

    expect(response.status).toBe(200)
    expect(response.headers.get('content-disposition')).toContain('finanzas-gastos-')
    expect(Array.from(bytes.slice(0, 3))).toEqual([0xef, 0xbb, 0xbf])
    expect(body).toContain('Fecha,Categoría,Descripción,Monto,Notas')
    expect(body).toContain('Insumos')
    expect(body).toContain('Compra de insumos')
    expect(body).toContain('85.00')
  })
})
