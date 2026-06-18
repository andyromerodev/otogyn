import { and, asc, eq, gt, lt } from 'drizzle-orm'
import type {
  AvailabilityRepository,
  CreateBlockedSlotInput,
  SaveAvailabilityInput,
  UpdateAvailabilityInput,
} from '../../domain/repositories/availability-repository'
import { BusinessRuleError } from '../../domain/errors/business-rule-error'
import type { BlockedTimeSlot } from '../../domain/entities/blocked-time-slot'
import type { DoctorAvailability } from '../../domain/entities/doctor-availability'
import { getDrizzleClient } from '../database/drizzle/client'
import { blockedTimeSlots, doctorAvailability } from '../database/schema'

const mapAvailability = (row: typeof doctorAvailability.$inferSelect): DoctorAvailability => ({
  id: row.id,
  organizationId: row.organizationId,
  weekday: row.weekday,
  startTime: row.startTime,
  endTime: row.endTime,
  isActive: row.isActive,
})

const mapBlockedSlot = (row: typeof blockedTimeSlots.$inferSelect): BlockedTimeSlot => ({
  id: row.id,
  organizationId: row.organizationId,
  startsAt: row.startsAt,
  endsAt: row.endsAt,
  reason: row.reason,
})

const defaultWeeklyAvailability = [1, 2, 3, 4, 5].map((weekday) => ({
  id: crypto.randomUUID(),
  weekday,
  startTime: '09:00',
  endTime: '18:00',
  isActive: true,
}))

export class DrizzleAvailabilityRepository implements AvailabilityRepository {
  private readonly db = getDrizzleClient()

  async listWeeklyAvailability(organizationId: string): Promise<DoctorAvailability[]> {
    const rows = await this.db
      .select()
      .from(doctorAvailability)
      .where(eq(doctorAvailability.organizationId, organizationId))
      .orderBy(asc(doctorAvailability.weekday), asc(doctorAvailability.startTime))

    if (rows.length > 0) {
      return rows.map(mapAvailability)
    }

    const createdRows = await this.db
      .insert(doctorAvailability)
      .values(
        defaultWeeklyAvailability.map((item) => ({
          id: item.id,
          organizationId,
          weekday: item.weekday,
          startTime: item.startTime,
          endTime: item.endTime,
          isActive: item.isActive,
        })),
      )
      .returning()

    return createdRows.map(mapAvailability)
  }

  async listBlockedSlots(organizationId: string, day: Date): Promise<BlockedTimeSlot[]> {
    const start = new Date(day)
    start.setHours(0, 0, 0, 0)

    const end = new Date(day)
    end.setHours(23, 59, 59, 999)

    const rows = await this.db
      .select()
      .from(blockedTimeSlots)
      .where(
        and(
          eq(blockedTimeSlots.organizationId, organizationId),
          lt(blockedTimeSlots.startsAt, end),
          gt(blockedTimeSlots.endsAt, start),
        ),
      )
      .orderBy(asc(blockedTimeSlots.startsAt))

    return rows.map(mapBlockedSlot)
  }

  async saveAvailability(input: SaveAvailabilityInput): Promise<DoctorAvailability> {
    const id = crypto.randomUUID()
    const now = new Date()

    const rows = await this.db
      .insert(doctorAvailability)
      .values({
        id,
        organizationId: input.organizationId,
        weekday: input.weekday,
        startTime: input.startTime,
        endTime: input.endTime,
        isActive: input.isActive,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [doctorAvailability.organizationId, doctorAvailability.weekday],
        set: {
          startTime: input.startTime,
          endTime: input.endTime,
          isActive: input.isActive,
          updatedAt: now,
        },
      })
      .returning()

    return mapAvailability(rows[0]!)
  }

  async updateAvailability(id: string, input: UpdateAvailabilityInput): Promise<DoctorAvailability> {
    const now = new Date()

    await this.db
      .update(doctorAvailability)
      .set({
        weekday: input.weekday,
        startTime: input.startTime,
        endTime: input.endTime,
        isActive: input.isActive,
        updatedAt: now,
      })
      .where(eq(doctorAvailability.id, id))

    const rows = await this.db
      .select()
      .from(doctorAvailability)
      .where(eq(doctorAvailability.id, id))
      .limit(1)

    if (!rows[0]) {
      throw new BusinessRuleError('Availability not found.')
    }

    return mapAvailability(rows[0])
  }

  async toggleAvailabilityActive(id: string, isActive: boolean): Promise<DoctorAvailability> {
    const now = new Date()

    await this.db
      .update(doctorAvailability)
      .set({
        isActive,
        updatedAt: now,
      })
      .where(eq(doctorAvailability.id, id))

    const rows = await this.db
      .select()
      .from(doctorAvailability)
      .where(eq(doctorAvailability.id, id))
      .limit(1)

    if (!rows[0]) {
      throw new BusinessRuleError('Availability not found.')
    }

    return mapAvailability(rows[0])
  }

  async createBlockedSlot(input: CreateBlockedSlotInput): Promise<BlockedTimeSlot> {
    if (input.startsAt.getTime() >= input.endsAt.getTime()) {
      throw new BusinessRuleError('Blocked slot start must be before end.')
    }

    const id = crypto.randomUUID()
    const now = new Date()

    const rows = await this.db
      .insert(blockedTimeSlots)
      .values({
        id,
        organizationId: input.organizationId,
        startsAt: input.startsAt,
        endsAt: input.endsAt,
        reason: input.reason ?? null,
        createdAt: now,
        updatedAt: now,
      })
      .returning()

    return mapBlockedSlot(rows[0]!)
  }

  async deleteBlockedSlot(id: string): Promise<void> {
    await this.db.delete(blockedTimeSlots).where(eq(blockedTimeSlots.id, id))
  }
}
