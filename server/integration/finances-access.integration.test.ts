import { fileURLToPath } from 'node:url'
import postgres from 'postgres'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { fetch, setup } from '@nuxt/test-utils/e2e'

const TEST_PORT = 3015
const TEST_BASE_URL = `http://localhost:${TEST_PORT}`
const ADMIN_EMAIL = `test-finances-admin-${crypto.randomUUID()}@otogyn.test`
const ASSISTANT_EMAIL = `test-finances-assistant-${crypto.randomUUID()}@otogyn.test`
const TEST_PASSWORD = 'TestPassword123!'
const OTHER_ORG_SLUG = `otogyn-fin-${crypto.randomUUID().slice(0, 8)}`

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

const ensureFinanceSchema = async (sql: postgres.Sql) => {
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
}

describe('finances access and scoping (integration, HTTP real)', () => {
  let adminCookie: string
  let assistantCookie: string
  let adminCategoryId: string

  beforeAll(async () => {
    const sql = postgres(process.env.TEST_DATABASE_URL!, { prepare: false })
    await ensureFinanceSchema(sql)

    const signUp = async (email: string, name: string) => {
      const response = await fetch('/api/auth/sign-up/email', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name, email, password: TEST_PASSWORD }),
      })

      if (response.status !== 200) {
        throw new Error(`No se pudo crear el usuario ${email} (status ${response.status}).`)
      }

      return extractSessionCookie(response.headers)
    }

    adminCookie = await signUp(ADMIN_EMAIL, 'Test Finances Admin')
    assistantCookie = await signUp(ASSISTANT_EMAIL, 'Test Finances Assistant')

    await sql`
      UPDATE organization_members
      SET role = 'assistant'
      WHERE user_id IN (SELECT id FROM users WHERE email = ${ASSISTANT_EMAIL})
    `

    const adminUser = await sql<{ id: string }[]>`
      SELECT id FROM users WHERE email = ${ADMIN_EMAIL}
    `
    const adminUserId = adminUser[0]?.id
    if (!adminUserId) {
      throw new Error('No se encontró el usuario admin principal.')
    }

    const createdOrg = await sql<{ id: string }[]>`
      INSERT INTO organizations (name, slug)
      VALUES ('OtoGyn Finanzas Org 2', ${OTHER_ORG_SLUG})
      RETURNING id
    `
    const otherOrgId = createdOrg[0]?.id
    if (!otherOrgId) {
      throw new Error('No se pudo crear la organización secundaria.')
    }

    const adminCategoryResponse = await fetch('/api/expense-categories', {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie: adminCookie },
      body: JSON.stringify({ name: 'Operación principal' }),
    })
    expect(adminCategoryResponse.status).toBe(200)
    adminCategoryId = (await adminCategoryResponse.json() as { id: string }).id

    const seedFinanceData = async (cookie: string, categoryId: string, concept: string, description: string, amount: number) => {
      const paymentResponse = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'content-type': 'application/json', cookie },
        body: JSON.stringify({
          amount,
          method: 'transferencia',
          concept,
          paidAt: '2026-07-05T15:00:00.000Z',
          notes: `${concept} note`,
        }),
      })
      expect(paymentResponse.status).toBe(200)

      const expenseResponse = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'content-type': 'application/json', cookie },
        body: JSON.stringify({
          categoryId,
          amount: amount / 2,
          description,
          expenseDate: '2026-07-04T15:00:00.000Z',
          notes: `${description} note`,
        }),
      })
      expect(expenseResponse.status).toBe(200)
    }

    await seedFinanceData(
      adminCookie,
      adminCategoryId,
      'Ingreso org principal',
      'Gasto org principal',
      500,
    )

    const otherCategoryRows = await sql<{ id: string }[]>`
      INSERT INTO expense_categories (organization_id, name, is_active)
      VALUES (${otherOrgId}, 'Operación secundaria', true)
      RETURNING id
    `
    const otherCategoryId = otherCategoryRows[0]?.id
    if (!otherCategoryId) {
      throw new Error('No se pudo crear la categoría secundaria.')
    }

    await sql`
      INSERT INTO payments (
        organization_id,
        created_by,
        amount,
        method,
        concept,
        paid_at,
        notes
      )
      VALUES (
        ${otherOrgId},
        ${adminUserId},
        900,
        'transferencia',
        'Ingreso org secundaria',
        ${new Date('2026-07-05T15:00:00.000Z')},
        'Ingreso org secundaria note'
      )
    `

    await sql`
      INSERT INTO expenses (
        organization_id,
        category_id,
        created_by,
        amount,
        description,
        expense_date,
        notes
      )
      VALUES (
        ${otherOrgId},
        ${otherCategoryId},
        ${adminUserId},
        450,
        'Gasto org secundaria',
        ${new Date('2026-07-04T15:00:00.000Z')},
        'Gasto org secundaria note'
      )
    `

    await sql.end()
  })

  afterAll(async () => {
    const sql = postgres(process.env.TEST_DATABASE_URL!, { prepare: false })
    await sql`
      DELETE FROM expenses
      WHERE organization_id IN (
        SELECT id FROM organizations WHERE slug IN ('otogyn', ${OTHER_ORG_SLUG})
      )
    `
    await sql`
      DELETE FROM payments
      WHERE organization_id IN (
        SELECT id FROM organizations WHERE slug IN ('otogyn', ${OTHER_ORG_SLUG})
      )
    `
    await sql`
      DELETE FROM expense_categories
      WHERE organization_id IN (
        SELECT id FROM organizations WHERE slug IN ('otogyn', ${OTHER_ORG_SLUG})
      )
    `
    await sql`
      DELETE FROM organization_members
      WHERE user_id IN (
        SELECT id FROM users WHERE email IN (${ADMIN_EMAIL}, ${ASSISTANT_EMAIL})
      )
    `
    await sql`
      DELETE FROM profiles
      WHERE user_id IN (
        SELECT id FROM users WHERE email IN (${ADMIN_EMAIL}, ${ASSISTANT_EMAIL})
      )
    `
    await sql`
      DELETE FROM accounts
      WHERE user_id IN (
        SELECT id FROM users WHERE email IN (${ADMIN_EMAIL}, ${ASSISTANT_EMAIL})
      )
    `
    await sql`
      DELETE FROM sessions
      WHERE user_id IN (
        SELECT id FROM users WHERE email IN (${ADMIN_EMAIL}, ${ASSISTANT_EMAIL})
      )
    `
    await sql`
      DELETE FROM users
      WHERE email IN (${ADMIN_EMAIL}, ${ASSISTANT_EMAIL})
    `
    await sql`
      DELETE FROM organizations
      WHERE slug IN ('otogyn', ${OTHER_ORG_SLUG})
    `
    await sql.end()
  })

  it('devuelve 403 para asistente en rutas de finanzas protegidas', async () => {
    const [paymentsResponse, expensesResponse, exportResponse, summaryResponse] = await Promise.all([
      fetch('/api/payments', { headers: { cookie: assistantCookie } }),
      fetch('/api/expenses', { headers: { cookie: assistantCookie } }),
      fetch('/api/finances/export?type=payments', { headers: { cookie: assistantCookie } }),
      fetch('/api/finances/summary', { headers: { cookie: assistantCookie } }),
    ])

    expect(paymentsResponse.status).toBe(403)
    expect(expensesResponse.status).toBe(403)
    expect(exportResponse.status).toBe(403)
    expect(summaryResponse.status).toBe(403)
  })

  it('aísla pagos, gastos y resumen por organización', async () => {
    const [paymentsResponse, expensesResponse, summaryResponse] = await Promise.all([
      fetch('/api/payments', { headers: { cookie: adminCookie } }),
      fetch('/api/expenses', { headers: { cookie: adminCookie } }),
      fetch('/api/finances/summary', { headers: { cookie: adminCookie } }),
    ])

    expect(paymentsResponse.status).toBe(200)
    expect(expensesResponse.status).toBe(200)
    expect(summaryResponse.status).toBe(200)

    const paymentsBody = await paymentsResponse.json() as { items: Array<{ concept: string }> }
    const expensesBody = await expensesResponse.json() as { items: Array<{ description: string }> }
    const summaryBody = await summaryResponse.json() as {
      income: number
      expenses: number
      balance: number
      series: Array<{ income: number; expenses: number }>
    }

    expect(paymentsBody.items).toHaveLength(1)
    expect(paymentsBody.items[0]?.concept).toBe('Ingreso org principal')
    expect(paymentsBody.items.some((item) => item.concept === 'Ingreso org secundaria')).toBe(false)

    expect(expensesBody.items).toHaveLength(1)
    expect(expensesBody.items[0]?.description).toBe('Gasto org principal')
    expect(expensesBody.items.some((item) => item.description === 'Gasto org secundaria')).toBe(false)

    expect(summaryBody.income).toBe(500)
    expect(summaryBody.expenses).toBe(250)
    expect(summaryBody.balance).toBe(250)
    expect(
      summaryBody.series.some((item) => item.income === 900 || item.expenses === 450),
    ).toBe(false)
  })

  it('valida query inválida en export y mantiene el CSV dentro del scope de la organización', async () => {
    const invalidResponse = await fetch('/api/finances/export?type=expenses&categoryId=bad-id', {
      headers: { cookie: adminCookie },
    })
    expect(invalidResponse.status).toBe(400)

    const exportResponse = await fetch('/api/finances/export?type=payments', {
      headers: { cookie: adminCookie },
    })
    const csv = await exportResponse.text()

    expect(exportResponse.status).toBe(200)
    expect(csv).toContain('Ingreso org principal')
    expect(csv).not.toContain('Ingreso org secundaria')
  })
})
