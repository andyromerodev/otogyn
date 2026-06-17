import { BusinessRuleError } from '../../domain/errors/business-rule-error'
import type { Appointment } from '../../domain/entities/appointment'
import type { AppointmentRepository } from '../../domain/repositories/appointment-repository'
import type { Role } from '../../domain/value-objects/role'

export interface CancelAppointmentInput {
  appointmentId: string
  updatedBy: string
  actorRole: Extract<Role, 'admin_doctor' | 'assistant'>
}

export class CancelAppointmentUseCase {
  constructor(private readonly appointmentRepository: AppointmentRepository) {}

  async execute(input: CancelAppointmentInput): Promise<Appointment> {
    const existingAppointment = await this.appointmentRepository.findById(input.appointmentId)

    if (!existingAppointment) {
      throw new BusinessRuleError('Cita no encontrada.')
    }

    if (existingAppointment.status === 'completed' && input.actorRole !== 'admin_doctor') {
      throw new BusinessRuleError('Solo admin_doctor puede cancelar una cita completada.')
    }

    if (existingAppointment.status === 'cancelled') {
      return existingAppointment
    }

    return this.appointmentRepository.save({
      ...existingAppointment,
      status: 'cancelled',
      cancelledAt: new Date(),
      updatedBy: input.updatedBy,
      updatedAt: new Date(),
    })
  }
}
