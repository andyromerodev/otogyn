import { BusinessRuleError } from '../../../domain/errors/business-rule-error'
import type { PatientRepository } from '../../../domain/repositories/patient-repository'
import type { ServiceRepository } from '../../../domain/repositories/service-repository'
import type { PublicBookingInput, PublicBookingResult } from '../../dto/public-booking'
import type { ScheduleAppointmentUseCase } from '../schedule-appointment'

export class CreatePublicBookingUseCase {
  constructor(
    private readonly patientRepository: PatientRepository,
    private readonly serviceRepository: ServiceRepository,
    private readonly scheduleAppointmentUseCase: ScheduleAppointmentUseCase,
  ) {}

  async execute(input: {
    organizationId: string
    systemUserId: string
    booking: PublicBookingInput
  }): Promise<PublicBookingResult> {
    const service = await this.serviceRepository.findById(input.booking.serviceId)
    if (!service || !service.isActive) {
      throw new BusinessRuleError('Servicio no disponible.')
    }

    const startAt = new Date(input.booking.startAt)
    if (Number.isNaN(startAt.getTime())) {
      throw new BusinessRuleError('Fecha y hora invalida.')
    }

    const endAt = new Date(startAt.getTime() + service.defaultDurationMinutes * 60000)

    const now = new Date()
    const patient = await this.patientRepository.create({
      id: crypto.randomUUID(),
      organizationId: input.organizationId,
      fullName: input.booking.patientName.trim(),
      phone: input.booking.patientPhone.trim(),
      email: input.booking.patientEmail ?? null,
      birthDate: null,
      documentId: null,
      administrativeNotes: null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    })

    const appointment = await this.scheduleAppointmentUseCase.execute({
      id: crypto.randomUUID(),
      organizationId: input.organizationId,
      patientId: patient.id,
      serviceId: service.id,
      professionalId: null,
      startAt,
      endAt,
      status: 'scheduled',
      isUrgent: false,
      reason: input.booking.reason ?? null,
      notes: null,
      createdBy: input.systemUserId,
      updatedBy: null,
      createdAt: now,
      updatedAt: now,
      cancelledAt: null,
    })

    return {
      appointmentId: appointment.id,
      date: appointment.startAt.toISOString().slice(0, 10),
      startAt: appointment.startAt.toISOString(),
      endAt: appointment.endAt.toISOString(),
      serviceName: service.name,
      durationMinutes: service.defaultDurationMinutes,
    }
  }
}
