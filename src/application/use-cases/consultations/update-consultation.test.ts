import { describe, expect, it } from 'vitest'
import { UpdateConsultationUseCase } from './update-consultation'
import { MockConsultationRepository } from '../../../infrastructure/mock/mock-consultation-repository'
import type { Consultation } from '../../../domain/entities/consultation'

const ORG = 'org_1'

function makeConsultation(overrides: Partial<Consultation> = {}): Consultation {
  const now = new Date()
  return {
    id: 'consultation_1',
    organizationId: ORG,
    appointmentId: 'appointment_1',
    patientId: 'patient_1',
    createdBy: 'user_doctor_1',
    anamnesisText: null,
    attachmentKeys: [],
    bloodPressure: null,
    heartRate: null,
    respiratoryRate: null,
    oxygenSaturation: null,
    temperature: null,
    additionalExams: [],
    diagnoses: [],
    appreciation: null,
    medications: [],
    treatmentPlan: null,
    auxiliaryExams: [],
    status: 'draft',
    completedAt: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

describe('UpdateConsultationUseCase', () => {
  it('applies a partial update while preserving existing fields', async () => {
    const consultation = makeConsultation({ anamnesisText: 'initial text', heartRate: 70 })
    const useCase = new UpdateConsultationUseCase(new MockConsultationRepository([consultation]))

    const result = await useCase.execute({
      consultationId: consultation.id,
      organizationId: ORG,
      data: { bloodPressure: '120/80' },
    })

    expect(result.bloodPressure).toBe('120/80')
    expect(result.anamnesisText).toBe('initial text')
    expect(result.heartRate).toBe(70)
  })

  it('rejects updates when the consultation is already completed', async () => {
    const consultation = makeConsultation({ status: 'completed', completedAt: new Date() })
    const useCase = new UpdateConsultationUseCase(new MockConsultationRepository([consultation]))

    await expect(
      useCase.execute({
        consultationId: consultation.id,
        organizationId: ORG,
        data: { anamnesisText: 'new text' },
      }),
    ).rejects.toThrow('No se puede modificar una consulta completada.')
  })

  it('rejects when the consultation does not exist', async () => {
    const useCase = new UpdateConsultationUseCase(new MockConsultationRepository([]))

    await expect(
      useCase.execute({
        consultationId: 'missing',
        organizationId: ORG,
        data: { anamnesisText: 'new text' },
      }),
    ).rejects.toThrow('Consulta no encontrada.')
  })
})
