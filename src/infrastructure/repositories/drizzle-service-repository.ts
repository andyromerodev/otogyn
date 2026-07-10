import { and, asc, count, eq, ilike } from 'drizzle-orm'
import { BusinessRuleError } from '../../domain/errors/business-rule-error'
import type { MedicalService } from '../../domain/entities/medical-service'
import type { ServiceListPublicPageQuery, ServiceListPublicPageResult, ServiceRepository, UpdateServiceInput } from '../../domain/repositories/service-repository'
import type { DrizzleClient } from '../database/drizzle/client'
import { getDrizzleClient } from '../database/drizzle/client'
import { services } from '../database/schema'

const mapService = (row: typeof services.$inferSelect): MedicalService => ({
  id: row.id,
  organizationId: row.organizationId,
  name: row.name,
  description: row.description,
  defaultDurationMinutes: row.defaultDurationMinutes,
  price: row.price === null ? null : Number(row.price),
  isActive: row.isActive,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
})

const isForeignKeyDeleteRestriction = (error: unknown): boolean => {
  const candidates = [
    error,
    error && typeof error === 'object' && 'cause' in error ? error.cause : null,
  ]

  return candidates.some((candidate) => {
    if (!candidate || typeof candidate !== 'object') {
      return false
    }

    const code = 'code' in candidate && typeof candidate.code === 'string' ? candidate.code : null
    const message =
      'message' in candidate && typeof candidate.message === 'string'
        ? candidate.message
        : null

    return (
      code === '23503' ||
      message?.includes('violates foreign key constraint') === true ||
      message?.includes('appointments_service_id_services_id_fk') === true
    )
  })
}

export class DrizzleServiceRepository implements ServiceRepository {
  constructor(private readonly db: DrizzleClient = getDrizzleClient()) {}

  async listByOrganization(organizationId: string, search = ''): Promise<MedicalService[]> {
    const conditions = [eq(services.organizationId, organizationId)]
    const trimmedSearch = search.trim()

    if (trimmedSearch) {
      conditions.push(ilike(services.name, `%${trimmedSearch}%`))
    }

    const rows = await this.db
      .select()
      .from(services)
      .where(and(...conditions))
      .orderBy(asc(services.name))

    return rows.map(mapService)
  }

  async listPublicServicesPaged(query: ServiceListPublicPageQuery): Promise<ServiceListPublicPageResult> {
    const pageSize = Math.min(Math.max(query.pageSize, 1), 50)
    const conditions = [
      eq(services.organizationId, query.organizationId),
      eq(services.isActive, true),
    ]

    if (query.search?.trim()) {
      conditions.push(ilike(services.name, `%${query.search.trim()}%`))
    }

    const where = and(...conditions)

    const totalRows = await this.db.select({ value: count() }).from(services).where(where)
    const total = totalRows[0]?.value ?? 0
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    const page = Math.min(Math.max(query.page, 1), totalPages)
    const offset = (page - 1) * pageSize

    const rows = await this.db
      .select()
      .from(services)
      .where(where)
      .orderBy(asc(services.name))
      .limit(pageSize)
      .offset(offset)

    return { items: rows.map(mapService), total }
  }

  async findById(id: string): Promise<MedicalService | null> {
    const rows = await this.db
      .select()
      .from(services)
      .where(eq(services.id, id))
      .limit(1)

    return rows[0] ? mapService(rows[0]) : null
  }

  async create(service: MedicalService): Promise<MedicalService> {
    const rows = await this.db
      .insert(services)
      .values({
        id: service.id,
        organizationId: service.organizationId,
        name: service.name,
        description: service.description,
        defaultDurationMinutes: service.defaultDurationMinutes,
        price: service.price === null ? null : service.price.toFixed(2),
        isActive: service.isActive,
        createdAt: service.createdAt,
        updatedAt: service.updatedAt,
      })
      .returning()

    return mapService(rows[0]!)
  }

  async update(input: UpdateServiceInput): Promise<MedicalService> {
    const now = new Date()

    await this.db
      .update(services)
      .set({
        name: input.name,
        description: input.description,
        defaultDurationMinutes: input.defaultDurationMinutes,
        price:
          input.price === undefined
            ? undefined
            : input.price === null
              ? null
              : input.price.toFixed(2),
        isActive: input.isActive,
        updatedAt: now,
      })
      .where(eq(services.id, input.id))

    const rows = await this.db
      .select()
      .from(services)
      .where(eq(services.id, input.id))
      .limit(1)

    return mapService(rows[0]!)
  }

  async delete(id: string): Promise<void> {
    try {
      await this.db
        .delete(services)
        .where(eq(services.id, id))
    } catch (error) {
      if (isForeignKeyDeleteRestriction(error)) {
        throw new BusinessRuleError('No se puede eliminar un servicio con citas asociadas.')
      }

      throw error
    }
  }
}
