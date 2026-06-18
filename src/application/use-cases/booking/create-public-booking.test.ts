import { describe, expect, it } from 'vitest'
import { CreatePublicBookingUseCase } from './create-public-booking'
import { MockAppointmentRepository } from '../../../infrastructure/mock/mock-appointment-repository'
import { MockAvailabilityRepository } from '../../../infrastructure/mock/mock-availability-repository'
import { MockPatientRepository } from '../../../infrastructure/mock/mock-patient-repository'
import { MockServiceRepository } from '../../../infrastructure/mock/mock-service-repository'
import { ScheduleAppointmentUseCase } from '../schedule-appointment'
import type { MedicalService } from '../../../domain/entities/medical-service'

const ORG = 'org_1'
const SYSTEM_USER = 'user_system'

function makeService(overrides: Partial<MedicalService> = {}): MedicalService {
  return {
    id: 'svc_1',
    organizationId: ORG,
    name: 'Consulta ORL',
    description: null,
    defaultDurationMinutes: 30,
    price: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

function makeTuesdayAt(hour: number): Date {
  const d = new Date()
  d.setFullYear(2025, 5, 10) // June 10 = Tuesday
  d.setHours(hour, 0, 0, 0)
  return d
}

describe('CreatePublicBookingUseCase', () => {
  it('creates a patient and schedules an appointment on a valid slot', async () => {
    const service = makeService()
    const patientRepo = new MockPatientRepository([])
    const serviceRepo = new MockServiceRepository([service])
    const apptRepo = new MockAppointmentRepository([])
    const availRepo = new MockAvailabilityRepository(
      [{ id: 'av1', organizationId: ORG, weekday: 2, startTime: '08:00', endTime: '18:00', isActive: true }],
      [],
    )
    const scheduleUseCase = new ScheduleAppointmentUseCase(apptRepo, patientRepo, serviceRepo, availRepo)
    const useCase = new CreatePublicBookingUseCase(patientRepo, serviceRepo, scheduleUseCase)

    const result = await useCase.execute({
      organizationId: ORG,
      systemUserId: SYSTEM_USER,
      booking: {
        serviceId: service.id,
        startAt: makeTuesdayAt(9).toISOString(),
        patientName: 'María García',
        patientPhone: '987654321',
        patientEmail: 'maria@example.com',
        reason: 'Dolor de oido',
      },
    })

    expect(result.serviceName).toBe('Consulta ORL')
    expect(result.durationMinutes).toBe(30)
    expect(result.appointmentId).toBeTruthy()
  })

  it('rejects booking for an inactive service', async () => {
    const service = makeService({ isActive: false })
    const patientRepo = new MockPatientRepository([])
    const serviceRepo = new MockServiceRepository([service])
    const apptRepo = new MockAppointmentRepository([])
    const availRepo = new MockAvailabilityRepository([], [])
    const scheduleUseCase = new ScheduleAppointmentUseCase(apptRepo, patientRepo, serviceRepo, availRepo)
    const useCase = new CreatePublicBookingUseCase(patientRepo, serviceRepo, scheduleUseCase)

    await expect(
      useCase.execute({
        organizationId: ORG,
        systemUserId: SYSTEM_USER,
        booking: {
          serviceId: service.id,
          startAt: makeTuesdayAt(9).toISOString(),
          patientName: 'Test',
          patientPhone: '999999999',
        },
      }),
    ).rejects.toThrow('Servicio no disponible.')
  })

  it('rejects booking outside availability window', async () => {
    const service = makeService()
    const patientRepo = new MockPatientRepository([])
    const serviceRepo = new MockServiceRepository([service])
    const apptRepo = new MockAppointmentRepository([])
    const availRepo = new MockAvailabilityRepository(
      [{ id: 'av1', organizationId: ORG, weekday: 2, startTime: '09:00', endTime: '17:00', isActive: true }],
      [],
    )
    const scheduleUseCase = new ScheduleAppointmentUseCase(apptRepo, patientRepo, serviceRepo, availRepo)
    const useCase = new CreatePublicBookingUseCase(patientRepo, serviceRepo, scheduleUseCase)

    await expect(
      useCase.execute({
        organizationId: ORG,
        systemUserId: SYSTEM_USER,
        booking: {
          serviceId: service.id,
          startAt: makeTuesdayAt(19).toISOString(), // outside 09:00-17:00
          patientName: 'Test',
          patientPhone: '999999999',
        },
      }),
    ).rejects.toThrow('No puede existir una cita fuera del horario disponible.')
  })
})
