import { describe, expect, it } from 'vitest'
import { UpdateAppointmentUseCase } from './update-appointment'
import { ScheduleAppointmentUseCase } from './schedule-appointment'
import { MockAppointmentRepository } from '../../infrastructure/mock/mock-appointment-repository'
import { MockAvailabilityRepository } from '../../infrastructure/mock/mock-availability-repository'
import { MockPatientRepository } from '../../infrastructure/mock/mock-patient-repository'
import { MockServiceRepository } from '../../infrastructure/mock/mock-service-repository'
import {
  demoAppointments,
  demoAvailability,
  demoBlockedSlots,
  demoServices,
} from '../../infrastructure/mock/demo-data'

describe('UpdateAppointmentUseCase', () => {
  const buildDependencies = (appointments = [...demoAppointments]) => {
    const appointmentRepository = new MockAppointmentRepository(appointments)
    const serviceRepository = new MockServiceRepository([...demoServices])
    const scheduleAppointmentUseCase = new ScheduleAppointmentUseCase(
      appointmentRepository,
      new MockPatientRepository([]),
      serviceRepository,
      new MockAvailabilityRepository([...demoAvailability], [...demoBlockedSlots]),
    )

    return {
      appointmentRepository,
      serviceRepository,
      scheduleAppointmentUseCase,
    }
  }

  it('blocks assistants from editing completed appointments', async () => {
    const completedAppointment = {
      ...demoAppointments[0]!,
      id: 'appointment_completed_1',
      status: 'completed' as const,
    }
    const dependencies = buildDependencies([completedAppointment])
    const useCase = new UpdateAppointmentUseCase(
      dependencies.appointmentRepository,
      dependencies.serviceRepository,
      dependencies.scheduleAppointmentUseCase,
    )

    await expect(
      useCase.execute({
        appointmentId: completedAppointment.id,
        patientId: completedAppointment.patientId,
        serviceId: completedAppointment.serviceId,
        professionalId: completedAppointment.professionalId,
        startAt: new Date(completedAppointment.startAt),
        isUrgent: completedAppointment.isUrgent,
        reason: completedAppointment.reason,
        notes: completedAppointment.notes,
        updatedBy: 'assistant-1',
        actorRole: 'assistant',
      }),
    ).rejects.toThrow('Solo admin_doctor puede editar una cita completada.')
  })
})
