import { describe, expect, it } from 'vitest'
import { StartConsultationUseCase } from './start-consultation'
import { MockAppointmentRepository } from '../../../infrastructure/mock/mock-appointment-repository'
import { MockConsultationRepository } from '../../../infrastructure/mock/mock-consultation-repository'
import type { Appointment } from '../../../domain/entities/appointment'
import type { Consultation } from '../../../domain/entities/consultation'

const ORG = 'org_1'
const OTHER_ORG = 'org_2'

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
    status: 'checked_in',
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

describe('StartConsultationUseCase', () => {
  it('is idempotent and returns the existing consultation for the appointment', async () => {
    const appointment = makeAppointment()
    const existingConsultation = makeConsultation()
    const useCase = new StartConsultationUseCase(
      new MockConsultationRepository([existingConsultation]),
      new MockAppointmentRepository([appointment]),
    )

    const result = await useCase.execute({
      appointmentId: appointment.id,
      organizationId: ORG,
      userId: 'user_doctor_1',
    })

    expect(result.id).toBe(existingConsultation.id)
  })

  it('creates a draft consultation with the appointment patient when checked_in', async () => {
    const appointment = makeAppointment({ status: 'checked_in' })
    const useCase = new StartConsultationUseCase(
      new MockConsultationRepository([]),
      new MockAppointmentRepository([appointment]),
    )

    const result = await useCase.execute({
      appointmentId: appointment.id,
      organizationId: ORG,
      userId: 'user_doctor_1',
    })

    expect(result.status).toBe('draft')
    expect(result.patientId).toBe(appointment.patientId)
    expect(result.appointmentId).toBe(appointment.id)
  })

  it('allows starting when appointment is in_progress', async () => {
    const appointment = makeAppointment({ status: 'in_progress' })
    const useCase = new StartConsultationUseCase(
      new MockConsultationRepository([]),
      new MockAppointmentRepository([appointment]),
    )

    const result = await useCase.execute({
      appointmentId: appointment.id,
      organizationId: ORG,
      userId: 'user_doctor_1',
    })

    expect(result.status).toBe('draft')
  })

  it('rejects when appointment status is not checked_in or in_progress', async () => {
    const appointment = makeAppointment({ status: 'scheduled' })
    const useCase = new StartConsultationUseCase(
      new MockConsultationRepository([]),
      new MockAppointmentRepository([appointment]),
    )

    await expect(
      useCase.execute({
        appointmentId: appointment.id,
        organizationId: ORG,
        userId: 'user_doctor_1',
      }),
    ).rejects.toThrow('Solo se puede iniciar una consulta para citas en estado checked_in o in_progress.')
  })

  it('rejects when the appointment does not exist', async () => {
    const useCase = new StartConsultationUseCase(
      new MockConsultationRepository([]),
      new MockAppointmentRepository([]),
    )

    await expect(
      useCase.execute({
        appointmentId: 'missing',
        organizationId: ORG,
        userId: 'user_doctor_1',
      }),
    ).rejects.toThrow('Cita no encontrada.')
  })

  it('rejects when the appointment belongs to a different organization', async () => {
    const appointment = makeAppointment({ organizationId: OTHER_ORG })
    const useCase = new StartConsultationUseCase(
      new MockConsultationRepository([]),
      new MockAppointmentRepository([appointment]),
    )

    await expect(
      useCase.execute({
        appointmentId: appointment.id,
        organizationId: ORG,
        userId: 'user_doctor_1',
      }),
    ).rejects.toThrow('Cita no encontrada.')
  })
})
