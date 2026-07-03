import { and, desc, eq } from 'drizzle-orm'
import { BusinessRuleError } from '../../domain/errors/business-rule-error'
import type { Consultation } from '../../domain/entities/consultation'
import type { ConsultationRepository } from '../../domain/repositories/consultation-repository'
import type { DrizzleClient } from '../database/drizzle/client'
import { getDrizzleClient } from '../database/drizzle/client'
import { consultations } from '../database/schema'

const mapConsultation = (row: typeof consultations.$inferSelect): Consultation => ({
  id: row.id,
  organizationId: row.organizationId,
  appointmentId: row.appointmentId,
  patientId: row.patientId,
  createdBy: row.createdBy,

  anamnesisText: row.anamnesisText,
  attachmentKeys: row.attachmentKeys,

  bloodPressure: row.bloodPressure,
  heartRate: row.heartRate,
  respiratoryRate: row.respiratoryRate,
  oxygenSaturation: row.oxygenSaturation,
  temperature: row.temperature,
  additionalExams: row.additionalExams,

  diagnoses: row.diagnoses,
  appreciation: row.appreciation,

  medications: row.medications,
  treatmentPlan: row.treatmentPlan,
  auxiliaryExams: row.auxiliaryExams,

  status: row.status,
  completedAt: row.completedAt,

  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
})

export class DrizzleConsultationRepository implements ConsultationRepository {
  constructor(private readonly db: DrizzleClient = getDrizzleClient()) {}

  async create(consultation: Consultation): Promise<Consultation> {
    const row = await this.db
      .insert(consultations)
      .values({
        id: consultation.id,
        organizationId: consultation.organizationId,
        appointmentId: consultation.appointmentId,
        patientId: consultation.patientId,
        createdBy: consultation.createdBy,

        anamnesisText: consultation.anamnesisText,
        attachmentKeys: consultation.attachmentKeys,

        bloodPressure: consultation.bloodPressure,
        heartRate: consultation.heartRate,
        respiratoryRate: consultation.respiratoryRate,
        oxygenSaturation: consultation.oxygenSaturation,
        temperature: consultation.temperature,
        additionalExams: consultation.additionalExams,

        diagnoses: consultation.diagnoses,
        appreciation: consultation.appreciation,

        medications: consultation.medications,
        treatmentPlan: consultation.treatmentPlan,
        auxiliaryExams: consultation.auxiliaryExams,

        status: consultation.status,
        completedAt: consultation.completedAt,

        createdAt: consultation.createdAt,
        updatedAt: consultation.updatedAt,
      })
      .returning()

    return mapConsultation(row[0]!)
  }

  async update(
    id: string,
    organizationId: string,
    partial: Partial<Consultation>,
  ): Promise<Consultation> {
    const row = await this.db
      .update(consultations)
      .set({
        ...partial,
        updatedAt: new Date(),
      })
      .where(and(eq(consultations.id, id), eq(consultations.organizationId, organizationId)))
      .returning()

    if (!row[0]) {
      throw new BusinessRuleError('Consultation not found.')
    }

    return mapConsultation(row[0])
  }

  async findById(id: string, organizationId: string): Promise<Consultation | null> {
    const row = await this.db
      .select()
      .from(consultations)
      .where(and(eq(consultations.id, id), eq(consultations.organizationId, organizationId)))
      .limit(1)

    return row[0] ? mapConsultation(row[0]) : null
  }

  async findByAppointmentId(
    appointmentId: string,
    organizationId: string,
  ): Promise<Consultation | null> {
    const row = await this.db
      .select()
      .from(consultations)
      .where(
        and(
          eq(consultations.appointmentId, appointmentId),
          eq(consultations.organizationId, organizationId),
        ),
      )
      .limit(1)

    return row[0] ? mapConsultation(row[0]) : null
  }

  async listByPatient(patientId: string, organizationId: string): Promise<Consultation[]> {
    const rows = await this.db
      .select()
      .from(consultations)
      .where(
        and(eq(consultations.patientId, patientId), eq(consultations.organizationId, organizationId)),
      )
      .orderBy(desc(consultations.createdAt))

    return rows.map(mapConsultation)
  }
}
