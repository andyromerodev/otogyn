import { organizationMembers, organizations, patients, services, users } from '../schema'
import type { DrizzleClient } from '../drizzle/client'

export const seedTestOrganization = async (
  db: DrizzleClient,
  overrides: Partial<typeof organizations.$inferInsert> = {},
) => {
  const [org] = await db
    .insert(organizations)
    .values({
      name: 'Organizacion de prueba',
      slug: `test-org-${crypto.randomUUID()}`,
      ...overrides,
    })
    .returning()

  return org!
}

export const seedTestUser = async (
  db: DrizzleClient,
  overrides: Partial<typeof users.$inferInsert> = {},
) => {
  const [user] = await db
    .insert(users)
    .values({
      name: 'Usuario de prueba',
      email: `test-${crypto.randomUUID()}@otogyn.test`,
      emailVerified: true,
      ...overrides,
    })
    .returning()

  return user!
}

export const seedTestMembership = async (
  db: DrizzleClient,
  organizationId: string,
  userId: string,
  overrides: Partial<typeof organizationMembers.$inferInsert> = {},
) => {
  const [membership] = await db
    .insert(organizationMembers)
    .values({
      organizationId,
      userId,
      role: 'admin_doctor',
      isActive: true,
      ...overrides,
    })
    .returning()

  return membership!
}

export const seedTestPatient = async (
  db: DrizzleClient,
  organizationId: string,
  overrides: Partial<typeof patients.$inferInsert> = {},
) => {
  const [patient] = await db
    .insert(patients)
    .values({
      organizationId,
      fullName: 'Paciente de prueba',
      phone: '999999999',
      ...overrides,
    })
    .returning()

  return patient!
}

export const seedTestService = async (
  db: DrizzleClient,
  organizationId: string,
  overrides: Partial<typeof services.$inferInsert> = {},
) => {
  const [service] = await db
    .insert(services)
    .values({
      organizationId,
      name: 'Servicio de prueba',
      defaultDurationMinutes: 30,
      isActive: true,
      ...overrides,
    })
    .returning()

  return service!
}
