import { BusinessRuleError } from '../../domain/errors/business-rule-error'
import type { AppointmentRepository } from '../../domain/repositories/appointment-repository'
import type { PaymentRepository } from '../../domain/repositories/payment-repository'
import type { PatientRepository } from '../../domain/repositories/patient-repository'
import type { ServiceRepository } from '../../domain/repositories/service-repository'
import type { AppointmentDetailDto } from '../dto/dashboard'

export interface GetAppointmentDetailInput {
  appointmentId: string
  organizationId: string
}

export class GetAppointmentDetailUseCase {
  constructor(
    private readonly appointmentRepository: AppointmentRepository,
    private readonly patientRepository: PatientRepository,
    private readonly serviceRepository: ServiceRepository,
    private readonly paymentRepository: PaymentRepository,
  ) {}

  async execute(input: GetAppointmentDetailInput): Promise<AppointmentDetailDto> {
    const appointment = await this.appointmentRepository.findById(input.appointmentId)

    if (!appointment || appointment.organizationId !== input.organizationId) {
      throw new BusinessRuleError('Cita no encontrada.')
    }

    const [patient, service, linkedPayment] = await Promise.all([
      this.patientRepository.findById(appointment.patientId),
      this.serviceRepository.findById(appointment.serviceId),
      this.paymentRepository.findByAppointmentId({
        organizationId: input.organizationId,
        appointmentId: appointment.id,
      }),
    ])

    return {
      id: appointment.id,
      patientId: appointment.patientId,
      serviceId: appointment.serviceId,
      professionalId: appointment.professionalId,
      patientName: patient?.fullName ?? 'Paciente desconocido',
      serviceName: service?.name ?? 'Servicio desconocido',
      startAt: appointment.startAt,
      endAt: appointment.endAt,
      status: appointment.status,
      isUrgent: appointment.isUrgent,
      reason: appointment.reason,
      notes: appointment.notes,
      agreedPrice: appointment.agreedPrice ?? service?.price ?? null,
      linkedPayment: linkedPayment
        ? {
            id: linkedPayment.id,
            amount: linkedPayment.amount,
            method: linkedPayment.method,
            paidAt: linkedPayment.paidAt,
          }
        : null,
    }
  }
}
