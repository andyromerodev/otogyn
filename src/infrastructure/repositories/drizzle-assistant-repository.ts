import { and, asc, eq } from 'drizzle-orm'
import type { Assistant } from '../../domain/entities/assistant'
import type { AssistantRepository, SaveAssistantInput } from '../../domain/repositories/assistant-repository'
import { getDrizzleClient } from '../database/drizzle/client'
import { organizationMembers, profiles, users } from '../database/schema'

const mapAssistant = (row: {
  userId: string
  organizationId: string
  role: string
  name: string
  email: string
  phone: string | null
  specialty: string | null
  createdAt: Date
  updatedAt: Date
}): Assistant => ({
  id: row.userId,
  userId: row.userId,
  organizationId: row.organizationId,
  role: row.role as Assistant['role'],
  name: row.name,
  email: row.email,
  phone: row.phone,
  specialty: row.specialty,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
})

export class DrizzleAssistantRepository implements AssistantRepository {
  private readonly db = getDrizzleClient()

  async listByOrganization(organizationId: string): Promise<Assistant[]> {
    const rows = await this.db
      .select({
        userId: users.id,
        organizationId: organizationMembers.organizationId,
        role: organizationMembers.role,
        name: users.name,
        email: users.email,
        phone: profiles.phone,
        specialty: profiles.specialty,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(organizationMembers)
      .innerJoin(users, eq(organizationMembers.userId, users.id))
      .leftJoin(profiles, eq(profiles.userId, users.id))
      .where(
        and(
          eq(organizationMembers.organizationId, organizationId),
          eq(organizationMembers.role, 'assistant'),
        ),
      )
      .orderBy(asc(users.name))

    return rows.map(mapAssistant)
  }

  async saveAssistant(input: SaveAssistantInput): Promise<Assistant> {
    const now = new Date()

    await this.db
      .insert(organizationMembers)
      .values({
        organizationId: input.organizationId,
        userId: input.userId,
        role: input.role,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [organizationMembers.organizationId, organizationMembers.userId],
        set: {
          role: input.role,
          updatedAt: now,
        },
      })

    await this.db
      .insert(profiles)
      .values({
        userId: input.userId,
        phone: input.phone ?? null,
        specialty: input.specialty ?? null,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: profiles.userId,
        set: {
          phone: input.phone ?? null,
          specialty: input.specialty ?? null,
          updatedAt: now,
        },
      })

    const row = await this.db
      .select({
        userId: users.id,
        organizationId: organizationMembers.organizationId,
        role: organizationMembers.role,
        name: users.name,
        email: users.email,
        phone: profiles.phone,
        specialty: profiles.specialty,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(organizationMembers)
      .innerJoin(users, eq(organizationMembers.userId, users.id))
      .leftJoin(profiles, eq(profiles.userId, users.id))
      .where(
        and(
          eq(organizationMembers.organizationId, input.organizationId),
          eq(organizationMembers.userId, input.userId),
        ),
      )
      .limit(1)

    return mapAssistant(row[0]!)
  }
}
