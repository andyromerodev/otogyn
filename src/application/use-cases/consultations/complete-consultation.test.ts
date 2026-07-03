import { describe, expect, it } from 'vitest'
import { CompleteConsultationUseCase } from './complete-consultation'
import { ChangeAppointmentStatusUseCase } from '../change-appointment-status'
import { MockAppointmentRepository } from '../../../infrastructure/mock/mock-appointment-repository'
import { MockConsultationRepository } from '../../../infrastructure/mock/mock-consultation-repository'
import type { Appointment } from '../../../domain/entities/appointment'
import type { Consultation } from '../../../domain/entities/consultation'

const ORG = 'org_1'

function makeAppointment(overrides: Partial<Appointment> = {}): Appointment {
  const now = new Date()
  return {
    id: 'appointment_1',
    organizationId: ORG,
    patientId: 'patient_1',
    serviceId: 'service_1',
    professionalId: 'user_doctor_1',
    startAt: now,
    endAt: now,
    status: 'in_progress',
    isUrgent: false,
    reason: null,
    notes: null,
    createdBy: 'user_assistant_1',
    updatedBy: null,
    createdAt: now,
    updatedAt: now,
    cancelledAt: null,
    ...overrides,
  }
}

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

describe('CompleteConsultationUseCase', () => {
  it('marks the consultation completed with completedAt and transitions the appointment', async () => {
    const appointment = makeAppointment()
    const consultation = makeConsultation()
    const appointmentRepository = new MockAppointmentRepository([appointment])
    const consultationRepository = new MockConsultationRepository([consultation])
    const useCase = new CompleteConsultationUseCase(
      consultationRepository,
      new ChangeAppointmentStatusUseCase(appointmentRepository),
    )

    const result = await useCase.execute({
      consultationId: consultation.id,
      organizationId: ORG,
      updatedBy: 'user_doctor_1',
      actorRole: 'admin_doctor',
    })

    expect(result.status).toBe('completed')
    expect(result.completedAt).toBeInstanceOf(Date)

    const updatedAppointment = await appointmentRepository.findById(appointment.id)
    expect(updatedAppointment?.status).toBe('completed')
  })

  it('rejects completing a consultation that is already completed', async () => {
    const appointment = makeAppointment({ status: 'completed' })
    const consultation = makeConsultation({ status: 'completed', completedAt: new Date() })
    const useCase = new CompleteConsultationUseCase(
      new MockConsultationRepository([consultation]),
      new ChangeAppointmentStatusUseCase(new MockAppointmentRepository([appointment])),
    )

    await expect(
      useCase.execute({
        consultationId: consultation.id,
        organizationId: ORG,
        updatedBy: 'user_doctor_1',
        actorRole: 'admin_doctor',
      }),
    ).rejects.toThrow('La consulta ya está completada.')
  })

  it('rejects when the consultation does not exist', async () => {
    const appointment = makeAppointment()
    const useCase = new CompleteConsultationUseCase(
      new MockConsultationRepository([]),
      new ChangeAppointmentStatusUseCase(new MockAppointmentRepository([appointment])),
    )

    await expect(
      useCase.execute({
        consultationId: 'missing',
        organizationId: ORG,
        updatedBy: 'user_doctor_1',
        actorRole: 'admin_doctor',
      }),
    ).rejects.toThrow('Consulta no encontrada.')
  })
})
