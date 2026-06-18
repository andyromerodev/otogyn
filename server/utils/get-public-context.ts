import { and, asc, eq } from 'drizzle-orm'
import { getDrizzleClient } from '../../src/infrastructure/database/drizzle/client'
import { organizations, organizationMembers } from '../../src/infrastructure/database/schema/index'

interface PublicContext {
  organizationId: string
  systemUserId: string
}

let cached: PublicContext | null = null
let cacheExpiresAt = 0
const CACHE_TTL_MS = 5 * 60 * 1000

export async function getPublicContext(): Promise<PublicContext> {
  if (cached && Date.now() < cacheExpiresAt) return cached

  const db = getDrizzleClient()

  const [org] = await db
    .select({ id: organizations.id })
    .from(organizations)
    .orderBy(asc(organizations.createdAt))
    .limit(1)

  if (!org) {
    throw createError({ statusCode: 503, statusMessage: 'Sistema no configurado.' })
  }

  const [member] = await db
    .select({ userId: organizationMembers.userId })
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.organizationId, org.id),
        eq(organizationMembers.role, 'admin_doctor'),
        eq(organizationMembers.isActive, true),
      ),
    )
    .limit(1)

  if (!member) {
    throw createError({ statusCode: 503, statusMessage: 'Sistema no configurado.' })
  }

  cached = { organizationId: org.id, systemUserId: member.userId }
  cacheExpiresAt = Date.now() + CACHE_TTL_MS
  return cached
}
