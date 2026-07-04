import { and, desc, eq } from 'drizzle-orm'
import type { TreatmentTemplate, CreateTreatmentTemplateInput } from '../../application/dto/consultation'
import type { TreatmentTemplateRepository } from '../../application/ports/treatment-template-repository'
import type { DrizzleClient } from '../database/drizzle/client'
import { getDrizzleClient } from '../database/drizzle/client'
import { treatmentTemplates } from '../database/schema'

const mapRow = (row: typeof treatmentTemplates.$inferSelect): TreatmentTemplate => ({
  id: row.id,
  organizationId: row.organizationId,
  name: row.name,
  diagnosisCode: row.diagnosisCode,
  diagnosisLabel: row.diagnosisLabel,
  treatmentPlan: row.treatmentPlan,
  medications: row.medications as TreatmentTemplate['medications'],
  auxiliaryExams: row.auxiliaryExams as string[],
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
})

export class DrizzleTreatmentTemplateRepository implements TreatmentTemplateRepository {
  constructor(private readonly db: DrizzleClient = getDrizzleClient()) {}

  async list(organizationId: string, diagnosisCode?: string): Promise<TreatmentTemplate[]> {
    const conditions = [eq(treatmentTemplates.organizationId, organizationId)]

    if (diagnosisCode) {
      conditions.push(eq(treatmentTemplates.diagnosisCode, diagnosisCode))
    }

    const rows = await this.db
      .select()
      .from(treatmentTemplates)
      .where(and(...conditions))
      .orderBy(desc(treatmentTemplates.createdAt))

    return rows.map(mapRow)
  }

  async create(input: CreateTreatmentTemplateInput): Promise<TreatmentTemplate> {
    const rows = await this.db
      .insert(treatmentTemplates)
      .values({
        organizationId: input.organizationId,
        name: input.name,
        diagnosisCode: input.diagnosisCode ?? null,
        diagnosisLabel: input.diagnosisLabel ?? null,
        treatmentPlan: input.treatmentPlan,
        medications: input.medications,
        auxiliaryExams: input.auxiliaryExams,
      })
      .returning()

    if (!rows[0]) {
      throw new Error('Failed to create treatment template.')
    }

    return mapRow(rows[0])
  }

  async delete(id: string, organizationId: string): Promise<boolean> {
    const result = await this.db
      .delete(treatmentTemplates)
      .where(
        and(
          eq(treatmentTemplates.id, id),
          eq(treatmentTemplates.organizationId, organizationId),
        ),
      )
      .returning({ id: treatmentTemplates.id })

    return result.length > 0
  }
}
