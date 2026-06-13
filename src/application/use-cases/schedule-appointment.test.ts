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
