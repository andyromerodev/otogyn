import { describe, expect, it } from 'vitest'
import { ChangeAppointmentStatusUseCase } from './change-appointment-status'
import { MockAppointmentRepository } from '../../infrastructure/mock/mock-appointment-repository'
import { demoAppointments } from '../../infrastructure/mock/demo-data'

describe('ChangeAppointmentStatusUseCase', () => {
  it('rejects changes on cancelled appointments', async () => {
    const cancelledAppointment = {
      ...demoAppointments[0]!,
      id: 'appointment_cancelled_1',
      status: 'cancelled' as const,
      cancelledAt: new Date(),
    }
    const useCase = new ChangeAppointmentStatusUseCase(new MockAppointmentRepository([cancelledAppointment]))

    await expect(
      useCase.execute({
        appointmentId: cancelledAppointment.id,
        status: 'confirmed',
        updatedBy: 'assistant-1',
        actorRole: 'assistant',
      }),
    ).rejects.toThrow('No se puede cambiar el estado de una cita cancelada.')
  })

  it('blocks assistants from changing completed appointments', async () => {
    const completedAppointment = {
      ...demoAppointments[0]!,
      id: 'appointment_completed_status',
      status: 'completed' as const,
    }
    const useCase = new ChangeAppointmentStatusUseCase(new MockAppointmentRepository([completedAppointment]))

    await expect(
      useCase.execute({
        appointmentId: completedAppointment.id,
        status: 'confirmed',
        updatedBy: 'assistant-1',
        actorRole: 'assistant',
      }),
    ).rejects.toThrow('Solo admin_doctor puede cambiar el estado de una cita completada.')
  })
})
