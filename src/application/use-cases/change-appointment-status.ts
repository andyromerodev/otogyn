import { BusinessRuleError } from '../../domain/errors/business-rule-error'
import type { Appointment } from '../../domain/entities/appointment'
import type { AppointmentRepository } from '../../domain/repositories/appointment-repository'
import type { AppointmentStatus } from '../../domain/value-objects/appointment-status'
import type { Role } from '../../domain/value-objects/role'

export interface ChangeAppointmentStatusInput {
  appointmentId: string
  status: Exclude<AppointmentStatus, 'cancelled'>
  updatedBy: string
  actorRole: Extract<Role, 'admin_doctor' | 'assistant'>
}

export class ChangeAppointmentStatusUseCase {
  constructor(private readonly appointmentRepository: AppointmentRepository) {}

  async execute(input: ChangeAppointmentStatusInput): Promise<Appointment> {
    const existingAppointment = await this.appointmentRepository.findById(input.appointmentId)

    if (!existingAppointment) {
      throw new BusinessRuleError('Cita no encontrada.')
    }

    if (existingAppointment.status === 'cancelled') {
      throw new BusinessRuleError('No se puede cambiar el estado de una cita cancelada.')
    }

    if (existingAppointment.status === 'completed' && input.actorRole !== 'admin_doctor') {
      throw new BusinessRuleError('Solo admin_doctor puede cambiar el estado de una cita completada.')
    }

    return this.appointmentRepository.save({
      ...existingAppointment,
      status: input.status,
      cancelledAt: null,
      updatedBy: input.updatedBy,
      updatedAt: new Date(),
    })
  }
}
