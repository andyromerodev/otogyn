import { describe, expect, it } from 'vitest'
import { ScheduleAppointmentUseCase } from './schedule-appointment'
import { MockAppointmentRepository } from '../../infrastructure/mock/mock-appointment-repository'
import { MockAvailabilityRepository } from '../../infrastructure/mock/mock-availability-repository'
import { MockPatientRepository } from '../../infrastructure/mock/mock-patient-repository'
import { MockServiceRepository } from '../../infrastructure/mock/mock-service-repository'
import {
  demoAppointments,
  demoAvailability,
  demoBlockedSlots,
  demoOrganization,
  demoPatients,
  demoServices,
} from '../../infrastructure/mock/demo-data'

describe('ScheduleAppointmentUseCase', () => {
  const buildUseCase = () =>
    new ScheduleAppointmentUseCase(
      new MockAppointmentRepository([...demoAppointments]),
      new MockPatientRepository([...demoPatients]),
      new MockServiceRepository([...demoServices]),
      new MockAvailabilityRepository([...demoAvailability], [...demoBlockedSlots]),
    )

  it('rejects collisions against active appointments', async () => {
    const useCase = buildUseCase()

    await expect(
      useCase.execute({
        id: 'appointment_test_collision',
        organizationId: demoOrganization.id,
        patientId: 'patient_1',
        serviceId: 'service_1',
        professionalId: 'user_doctor_ana',
        startAt: new Date(demoAppointments[2].startAt),
        endAt: new Date(demoAppointments[2].endAt),
        status: 'scheduled',
        isUrgent: false,
        reason: null,
        notes: null,
        createdBy: 'user_assistant_lucia',
        updatedBy: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        cancelledAt: null,
      }),
    ).rejects.toThrow('No puede existir una cita que choque con otra cita activa.')
  })

  it('rejects an appointment outside the availability window', async () => {
    const useCase = buildUseCase()

    const startAt = new Date(demoAppointments[0]!.startAt)
    startAt.setHours(19, 0, 0, 0) // after 18:00 close
    const endAt = new Date(startAt)
    endAt.setMinutes(endAt.getMinutes() + 30)

    await expect(
      useCase.execute({
        id: 'appointment_outside_hours',
        organizationId: demoOrganization.id,
        patientId: 'patient_1',
        serviceId: 'service_1',
        professionalId: null,
        startAt,
        endAt,
        status: 'scheduled',
        isUrgent: false,
        reason: null,
        notes: null,
        createdBy: 'user_assistant_lucia',
        updatedBy: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        cancelledAt: null,
      }),
    ).rejects.toThrow('No puede existir una cita fuera del horario disponible.')
  })

  it('accepts an appointment that ends exactly at the availability window boundary', async () => {
    const useCase = new ScheduleAppointmentUseCase(
      new MockAppointmentRepository([]),
      new MockPatientRepository([...demoPatients]),
      new MockServiceRepository([...demoServices]),
      new MockAvailabilityRepository(
        [{ id: 'av_tue', organizationId: demoOrganization.id, weekday: 2, startTime: '09:00', endTime: '17:00', isActive: true }],
        [],
      ),
    )

    const startAt = new Date()
    startAt.setFullYear(2025, 5, 10) // Tuesday
    startAt.setHours(16, 30, 0, 0)
    const endAt = new Date(startAt)
    endAt.setMinutes(endAt.getMinutes() + 30) // ends at exactly 17:00

    const appointment = await useCase.execute({
      id: 'appointment_boundary_ok',
      organizationId: demoOrganization.id,
      patientId: 'patient_1',
      serviceId: 'service_1',
      professionalId: null,
      startAt,
      endAt,
      status: 'scheduled',
      isUrgent: false,
      reason: null,
      notes: null,
      createdBy: 'user_assistant_lucia',
      updatedBy: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      cancelledAt: null,
    })

    expect(appointment.id).toBe('appointment_boundary_ok')
  })

  it('allows a non-overlapping appointment inside availability', async () => {
    const useCase = buildUseCase()
    const startAt = new Date(demoAppointments[4].endAt)
    startAt.setMinutes(startAt.getMinutes() + 30)
    const endAt = new Date(startAt)
    endAt.setMinutes(endAt.getMinutes() + 30)

    const appointment = await useCase.execute({
      id: 'appointment_test_ok',
      organizationId: demoOrganization.id,
      patientId: 'patient_1',
      serviceId: 'service_1',
      professionalId: 'user_doctor_ana',
      startAt,
      endAt,
      status: 'scheduled',
      isUrgent: false,
      reason: null,
      notes: null,
      createdBy: 'user_assistant_lucia',
      updatedBy: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      cancelledAt: null,
    })

    expect(appointment.id).toBe('appointment_test_ok')
  })
})
