import { and, asc, desc, eq } from 'drizzle-orm'
import { BusinessRuleError } from '../../domain/errors/business-rule-error'
import type { Assistant } from '../../domain/entities/assistant'
import type {
  AssistantRepository,
  SaveAssistantInput,
  UpdateAssistantInput,
} from '../../domain/repositories/assistant-repository'
import type { DrizzleClient } from '../database/drizzle/client'
import { getDrizzleClient } from '../database/drizzle/client'
import { appointmentStatusHistory, appointments, organizationMembers, profiles, users } from '../database/schema'

const mapAssistant = (row: {
  userId: string
  organizationId: string
  role: string
  name: string
  email: string
  phone: string | null
  specialty: string | null
  isActive: boolean
  deactivatedAt: Date | null
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
  isActive: row.isActive,
  deactivatedAt: row.deactivatedAt,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
})

export class DrizzleAssistantRepository implements AssistantRepository {
  constructor(private readonly db: DrizzleClient = getDrizzleClient()) {}

  private async resolveAssistant(organizationId: string, userId: string): Promise<Assistant> {
    const row = await this.db
      .select({
        userId: users.id,
        organizationId: organizationMembers.organizationId,
        role: organizationMembers.role,
        name: users.name,
        email: users.email,
        phone: profiles.phone,
        specialty: profiles.specialty,
        isActive: organizationMembers.isActive,
        deactivatedAt: organizationMembers.deactivatedAt,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(organizationMembers)
      .innerJoin(users, eq(organizationMembers.userId, users.id))
      .leftJoin(profiles, eq(profiles.userId, users.id))
      .where(
        and(
          eq(organizationMembers.organizationId, organizationId),
          eq(organizationMembers.userId, userId),
          eq(organizationMembers.role, 'assistant'),
        ),
      )
      .limit(1)

    if (!row[0]) {
      throw new BusinessRuleError('Assistant not found.')
    }

    return mapAssistant(row[0])
  }

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
        isActive: organizationMembers.isActive,
        deactivatedAt: organizationMembers.deactivatedAt,
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
      .orderBy(desc(organizationMembers.isActive), asc(users.name))

    return rows.map(mapAssistant)
  }

  async saveAssistant(input: SaveAssistantInput): Promise<Assistant> {
    const now = new Date()

    if (input.name) {
      await this.db
        .update(users)
        .set({
          name: input.name.trim(),
          updatedAt: now,
        })
        .where(eq(users.id, input.userId))
    }

    await this.db
      .insert(organizationMembers)
      .values({
        organizationId: input.organizationId,
        userId: input.userId,
        role: input.role,
        isActive: true,
        deactivatedAt: null,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [organizationMembers.organizationId, organizationMembers.userId],
        set: {
          role: input.role,
          isActive: true,
          deactivatedAt: null,
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

    return this.resolveAssistant(input.organizationId, input.userId)
  }

  async updateAssistant(input: UpdateAssistantInput): Promise<Assistant> {
    const now = new Date()

    await this.resolveAssistant(input.organizationId, input.userId)

    await this.db
      .update(users)
      .set({
        name: input.name.trim(),
        updatedAt: now,
      })
      .where(eq(users.id, input.userId))

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

    return this.resolveAssistant(input.organizationId, input.userId)
  }

  async deactivateAssistant(organizationId: string, userId: string): Promise<Assistant> {
    const now = new Date()

    const row = await this.db
      .update(organizationMembers)
      .set({
        isActive: false,
        deactivatedAt: now,
        updatedAt: now,
      })
      .where(
        and(
          eq(organizationMembers.organizationId, organizationId),
          eq(organizationMembers.userId, userId),
          eq(organizationMembers.role, 'assistant'),
        ),
      )
      .returning({ userId: organizationMembers.userId })

    if (!row[0]) {
      throw new BusinessRuleError('Assistant not found.')
    }

    return this.resolveAssistant(organizationId, userId)
  }

  async reactivateAssistant(organizationId: string, userId: string): Promise<Assistant> {
    const now = new Date()

    const row = await this.db
      .update(organizationMembers)
      .set({
        isActive: true,
        deactivatedAt: null,
        updatedAt: now,
      })
      .where(
        and(
          eq(organizationMembers.organizationId, organizationId),
          eq(organizationMembers.userId, userId),
          eq(organizationMembers.role, 'assistant'),
        ),
      )
      .returning({ userId: organizationMembers.userId })

    if (!row[0]) {
      throw new BusinessRuleError('Assistant not found.')
    }

    return this.resolveAssistant(organizationId, userId)
  }

  async deleteAssistant(organizationId: string, userId: string): Promise<void> {
    await this.resolveAssistant(organizationId, userId)

    const createdAppointments = await this.db
      .select({ id: appointments.id })
      .from(appointments)
      .where(eq(appointments.createdBy, userId))
      .limit(1)

    const changedStatuses = await this.db
      .select({ id: appointmentStatusHistory.id })
      .from(appointmentStatusHistory)
      .where(eq(appointmentStatusHistory.changedBy, userId))
      .limit(1)

    if (createdAppointments[0] || changedStatuses[0]) {
      throw new BusinessRuleError(
        'Cannot delete assistant with operational records. Desvinculalo o mantenlo inactivo.',
      )
    }

    await this.db.delete(users).where(eq(users.id, userId))
  }
}
