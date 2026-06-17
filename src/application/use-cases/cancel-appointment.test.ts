import { describe, expect, it } from 'vitest'
import { CancelAppointmentUseCase } from './cancel-appointment'
import { MockAppointmentRepository } from '../../infrastructure/mock/mock-appointment-repository'
import { demoAppointments } from '../../infrastructure/mock/demo-data'

describe('CancelAppointmentUseCase', () => {
  it('blocks assistants from cancelling completed appointments', async () => {
    const completedAppointment = {
      ...demoAppointments[0]!,
      id: 'appointment_completed_cancel',
      status: 'completed' as const,
    }
    const useCase = new CancelAppointmentUseCase(new MockAppointmentRepository([completedAppointment]))

    await expect(
      useCase.execute({
        appointmentId: completedAppointment.id,
        updatedBy: 'assistant-1',
        actorRole: 'assistant',
      }),
    ).rejects.toThrow('Solo admin_doctor puede cancelar una cita completada.')
  })

  it('marks a regular appointment as cancelled', async () => {
    const scheduledAppointment = {
      ...demoAppointments[0]!,
      id: 'appointment_scheduled_cancel',
      status: 'scheduled' as const,
      cancelledAt: null,
    }
    const useCase = new CancelAppointmentUseCase(new MockAppointmentRepository([scheduledAppointment]))

    const result = await useCase.execute({
      appointmentId: scheduledAppointment.id,
      updatedBy: 'assistant-1',
      actorRole: 'assistant',
    })

    expect(result.status).toBe('cancelled')
    expect(result.cancelledAt).not.toBeNull()
  })
})
