import { and, count, desc, eq, ilike, or } from 'drizzle-orm'
import { BusinessRuleError } from '../../domain/errors/business-rule-error'
import type { PreEvaluationForm } from '../../domain/entities/pre-evaluation-form'
import type {
  PreEvaluationFormListPageQuery,
  PreEvaluationFormListPageResult,
  PreEvaluationFormRepository,
} from '../../domain/repositories/pre-evaluation-form-repository'
import type { DrizzleClient } from '../database/drizzle/client'
import { getDrizzleClient } from '../database/drizzle/client'
import { preEvaluationForms } from '../database/schema'

const mapPreEvaluationForm = (
  row: typeof preEvaluationForms.$inferSelect,
): PreEvaluationForm => ({
  id: row.id,
  organizationId: row.organizationId,
  patientId: row.patientId,

  fullName: row.fullName,
  age: row.age,
  city: row.city,
  phone: row.phone,
  email: row.email,

  mainReasons: row.mainReasons,
  mainReasonOtherText: row.mainReasonOtherText,
  complaintDescription: row.complaintDescription,

  symptomDuration: row.symptomDuration,
  symptomPattern: row.symptomPattern,

  associatedSymptoms: row.associatedSymptoms,
  aggravatingFactors: row.aggravatingFactors,

  hasPriorRefluxDiagnosis: row.hasPriorRefluxDiagnosis,
  hasPriorTreatment: row.hasPriorTreatment,
  priorMedicationUsed: row.priorMedicationUsed,
  treatmentImprovement: row.treatmentImprovement,

  priorExams: row.priorExams,
  attachmentKeys: row.attachmentKeys,

  alertSigns: row.alertSigns,
  consultationExpectations: row.consultationExpectations,

  consentInfoTruthful: row.consentInfoTruthful,
  consentUnderstandsNotConsultation: row.consentUnderstandsNotConsultation,

  status: row.status,

  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
})

export class DrizzlePreEvaluationFormRepository implements PreEvaluationFormRepository {
  constructor(private readonly db: DrizzleClient = getDrizzleClient()) {}

  async create(form: PreEvaluationForm): Promise<PreEvaluationForm> {
    const row = await this.db
      .insert(preEvaluationForms)
      .values({
        id: form.id,
        organizationId: form.organizationId,
        patientId: form.patientId,

        fullName: form.fullName,
        age: form.age,
        city: form.city,
        phone: form.phone,
        email: form.email,

        mainReasons: form.mainReasons,
        mainReasonOtherText: form.mainReasonOtherText,
        complaintDescription: form.complaintDescription,

        symptomDuration: form.symptomDuration,
        symptomPattern: form.symptomPattern,

        associatedSymptoms: form.associatedSymptoms,
        aggravatingFactors: form.aggravatingFactors,

        hasPriorRefluxDiagnosis: form.hasPriorRefluxDiagnosis,
        hasPriorTreatment: form.hasPriorTreatment,
        priorMedicationUsed: form.priorMedicationUsed,
        treatmentImprovement: form.treatmentImprovement,

        priorExams: form.priorExams,
        attachmentKeys: form.attachmentKeys,

        alertSigns: form.alertSigns,
        consultationExpectations: form.consultationExpectations,

        consentInfoTruthful: form.consentInfoTruthful,
        consentUnderstandsNotConsultation: form.consentUnderstandsNotConsultation,

        status: form.status,

        createdAt: form.createdAt,
        updatedAt: form.updatedAt,
      })
      .returning()

    return mapPreEvaluationForm(row[0]!)
  }

  async listPage(query: PreEvaluationFormListPageQuery): Promise<PreEvaluationFormListPageResult> {
    const pageSize = Math.min(Math.max(query.pageSize, 1), 50)

    const conditions = [eq(preEvaluationForms.organizationId, query.organizationId)]

    const trimmedSearch = query.search.trim()
    if (trimmedSearch) {
      const searchLike = `%${trimmedSearch}%`
      conditions.push(
        or(
          ilike(preEvaluationForms.fullName, searchLike),
          ilike(preEvaluationForms.phone, searchLike),
          ilike(preEvaluationForms.email, searchLike),
        )!,
      )
    }

    if (query.filter === 'pending_review' || query.filter === 'reviewed') {
      conditions.push(eq(preEvaluationForms.status, query.filter))
    }

    const [{ value: allTotal = 0 } = { value: 0 }] = await this.db
      .select({ value: count() })
      .from(preEvaluationForms)
      .where(eq(preEvaluationForms.organizationId, query.organizationId))

    const [{ value: total = 0 } = { value: 0 }] = await this.db
      .select({ value: count() })
      .from(preEvaluationForms)
      .where(and(...conditions))

    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    const page = Math.min(Math.max(query.page, 1), totalPages)
    const offset = (page - 1) * pageSize

    const rows = await this.db
      .select()
      .from(preEvaluationForms)
      .where(and(...conditions))
      .orderBy(desc(preEvaluationForms.createdAt))
      .limit(pageSize)
      .offset(offset)

    return {
      items: rows.map(mapPreEvaluationForm),
      total,
      allTotal,
      page,
      pageSize,
      totalPages,
    }
  }

  async findById(id: string, organizationId: string): Promise<PreEvaluationForm | null> {
    const row = await this.db
      .select()
      .from(preEvaluationForms)
      .where(and(eq(preEvaluationForms.id, id), eq(preEvaluationForms.organizationId, organizationId)))
      .limit(1)

    return row[0] ? mapPreEvaluationForm(row[0]) : null
  }

  async update(form: PreEvaluationForm): Promise<PreEvaluationForm> {
    const row = await this.db
      .update(preEvaluationForms)
      .set({
        patientId: form.patientId,
        status: form.status,
        updatedAt: form.updatedAt,
      })
      .where(
        and(
          eq(preEvaluationForms.id, form.id),
          eq(preEvaluationForms.organizationId, form.organizationId),
        ),
      )
      .returning()

    if (!row[0]) {
      throw new BusinessRuleError('Pre-evaluation form not found.')
    }

    return mapPreEvaluationForm(row[0])
  }
}
