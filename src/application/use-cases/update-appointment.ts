import { BusinessRuleError } from '../../domain/errors/business-rule-error'
import type { Appointment } from '../../domain/entities/appointment'
import type { AppointmentRepository } from '../../domain/repositories/appointment-repository'
import type { ServiceRepository } from '../../domain/repositories/service-repository'
import type { Role } from '../../domain/value-objects/role'
import type { ScheduleAppointmentUseCase } from './schedule-appointment'

export interface UpdateAppointmentInput {
  appointmentId: string
  patientId: string
  serviceId: string
  agreedPrice?: number | null
  professionalId: string | null
  startAt: Date
  isUrgent: boolean
  reason: string | null
  notes: string | null
  updatedBy: string
  actorRole: Extract<Role, 'admin_doctor' | 'assistant'>
}

export class UpdateAppointmentUseCase {
  constructor(
    private readonly appointmentRepository: AppointmentRepository,
    private readonly serviceRepository: ServiceRepository,
    private readonly scheduleAppointmentUseCase: ScheduleAppointmentUseCase,
  ) {}

  async execute(input: UpdateAppointmentInput): Promise<Appointment> {
    const existingAppointment = await this.appointmentRepository.findById(input.appointmentId)

    if (!existingAppointment) {
      throw new BusinessRuleError('Cita no encontrada.')
    }

    if (existingAppointment.status === 'completed' && input.actorRole !== 'admin_doctor') {
      throw new BusinessRuleError('Solo admin_doctor puede editar una cita completada.')
    }

    const service = await this.serviceRepository.findById(input.serviceId)

    if (!service) {
      throw new BusinessRuleError('No puede existir una cita sin servicio.')
    }

    const endAt = new Date(input.startAt)
    endAt.setMinutes(endAt.getMinutes() + service.defaultDurationMinutes)

    return this.scheduleAppointmentUseCase.execute({
      ...existingAppointment,
      patientId: input.patientId,
      serviceId: input.serviceId,
      agreedPrice: input.agreedPrice === undefined ? existingAppointment.agreedPrice : input.agreedPrice,
      professionalId: input.professionalId,
      startAt: input.startAt,
      endAt,
      isUrgent: input.isUrgent,
      reason: input.reason,
      notes: input.notes,
      updatedBy: input.updatedBy,
      updatedAt: new Date(),
    })
  }
}
