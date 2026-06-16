import { asc, eq } from 'drizzle-orm'
import type { MedicalService } from '../../domain/entities/medical-service'
import type { ServiceRepository } from '../../domain/repositories/service-repository'
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

export class DrizzleServiceRepository implements ServiceRepository {
  private readonly db = getDrizzleClient()

  async listByOrganization(organizationId: string): Promise<MedicalService[]> {
    const rows = await this.db
      .select()
      .from(services)
      .where(eq(services.organizationId, organizationId))
      .orderBy(asc(services.name))

    return rows.map(mapService)
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
}
