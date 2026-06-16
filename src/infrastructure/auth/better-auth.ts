import { drizzleAdapter } from '@better-auth/drizzle-adapter'
import { betterAuth } from 'better-auth'
import { and, asc, count, eq } from 'drizzle-orm'
import { getDrizzleClient } from '../database/drizzle/client'
import {
  accounts,
  organizationMembers,
  organizations,
  profiles,
  sessions,
  users,
  verifications,
} from '../database/schema'

const DEFAULT_ORGANIZATION = {
  name: 'Consulta OtoGyn',
  slug: 'otogyn',
}

const isProduction = process.env.NODE_ENV === 'production'

const createBetterAuth = () => {
  const db = getDrizzleClient()

  return betterAuth({
    appName: 'OtoGyn',
    baseURL: process.env.AUTH_URL ?? 'http://localhost:3000',
    basePath: '/api/auth',
    trustedOrigins: [process.env.AUTH_URL ?? 'http://localhost:3000'],
    secret: process.env.AUTH_SECRET,
    database: drizzleAdapter(db, {
      provider: 'pg',
      schema: {
        user: users,
        session: sessions,
        account: accounts,
        verification: verifications,
      },
    }),
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
      disableSignUp: isProduction,
      minPasswordLength: 8,
      maxPasswordLength: 128,
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
    },
    advanced: {
      useSecureCookies: isProduction,
      database: {
        generateId: false,
      },
    },
    logger: {
      level: 'error',
    },
    databaseHooks: {
      user: {
        create: {
          after: async (user) => {
            await bootstrapMembershipForUser(user)
          },
        },
      },
    },
  })
}

type BetterAuthInstance = ReturnType<typeof createBetterAuth>

let authInstance: BetterAuthInstance | null = null

export const isBetterAuthEnabled = () => Boolean(process.env.DATABASE_URL && process.env.AUTH_SECRET)

const getOrCreateDefaultOrganizationId = async () => {
  const db = getDrizzleClient()
  const existing = await db
    .select({ id: organizations.id })
    .from(organizations)
    .where(eq(organizations.slug, DEFAULT_ORGANIZATION.slug))
    .limit(1)

  if (existing[0]) {
    return existing[0].id
  }

  const created = await db
    .insert(organizations)
    .values(DEFAULT_ORGANIZATION)
    .returning({ id: organizations.id })

  if (created[0]?.id) {
    return created[0].id
  } else {
    console.error('[auth][server][bootstrap] default organization insert returned no id')
    return undefined
  }
}

const bootstrapMembershipForUser = async (user: { id: string }) => {
  const db = getDrizzleClient()
  const organizationId = await getOrCreateDefaultOrganizationId()

  if (!organizationId) {
    return
  }

  const [memberCountResult, existingMembership] = await Promise.all([
    db.select({ value: count() }).from(organizationMembers),
    db
      .select({ userId: organizationMembers.userId })
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationId, organizationId),
          eq(organizationMembers.userId, user.id),
        ),
      )
      .limit(1),
  ])

  if (!existingMembership[0]) {
    const isFirstMember = (memberCountResult[0]?.value ?? 0) === 0

    await db.insert(organizationMembers).values({
      organizationId,
      userId: user.id,
      role: isFirstMember ? 'admin_doctor' : 'assistant',
    })
  }

  const existingProfile = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1)

  if (!existingProfile[0]) {
    await db.insert(profiles).values({
      userId: user.id,
      specialty: null,
      phone: null,
    })
  }
}

export const getBetterAuth = () => {
  if (!isBetterAuthEnabled()) {
    return null
  }

  if (authInstance) {
    return authInstance
  }

  authInstance = createBetterAuth()

  return authInstance
}

export const getOrganizationRoleForUser = async (userId: string, organizationSlug = DEFAULT_ORGANIZATION.slug) => {
  const db = getDrizzleClient()

  const rows = await db
    .select({
      organizationId: organizationMembers.organizationId,
      role: organizationMembers.role,
    })
    .from(organizationMembers)
    .innerJoin(organizations, eq(organizationMembers.organizationId, organizations.id))
    .where(and(eq(organizationMembers.userId, userId), eq(organizations.slug, organizationSlug)))
    .orderBy(asc(organizationMembers.createdAt))
    .limit(1)

  return rows[0] ?? null
}

const extractAuthErrorMessage = async (response: Response) => {
  const payload = await response
    .clone()
    .json()
    .catch(() => null)

  if (payload && typeof payload === 'object') {
    if ('message' in payload && typeof payload.message === 'string') {
      return payload.message
    }

    if ('error' in payload && typeof payload.error === 'string') {
      return payload.error
    }
  }

  return 'No se pudo crear la cuenta del asistente.'
}

const createStatusError = (statusCode: number, statusMessage: string) =>
  Object.assign(new Error(statusMessage), {
    statusCode,
    statusMessage,
  })

export interface ProvisionCredentialUserInput {
  name: string
  email: string
  password: string
}

export interface ProvisionedCredentialUser {
  id: string
  name: string
  email: string
}

export const provisionCredentialUser = async (
  input: ProvisionCredentialUserInput,
): Promise<ProvisionedCredentialUser> => {
  const auth = getBetterAuth()

  if (!auth) {
    throw createStatusError(503, 'Authentication is not configured.')
  }

  const normalizedEmail = input.email.trim().toLowerCase()
  const baseUrl = process.env.AUTH_URL ?? 'http://localhost:3000'

  const response = await auth.handler(
    new Request(`${baseUrl}/api/auth/sign-up/email`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        name: input.name.trim(),
        email: normalizedEmail,
        password: input.password,
      }),
    }),
  )

  if (!response.ok) {
    throw createStatusError(response.status, await extractAuthErrorMessage(response))
  }

  const db = getDrizzleClient()
  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
    })
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1)

  if (!rows[0]) {
    throw createStatusError(500, 'La cuenta se creo, pero no se pudo resolver el usuario.')
  }

  return rows[0]
}
