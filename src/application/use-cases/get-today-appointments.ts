import type { TodayAppointmentDto } from '../dto/dashboard'
import type { AppointmentRepository } from '../../domain/repositories/appointment-repository'
import type { PatientRepository } from '../../domain/repositories/patient-repository'
import type { ServiceRepository } from '../../domain/repositories/service-repository'

export class GetTodayAppointmentsUseCase {
  constructor(
    private readonly appointmentRepository: AppointmentRepository,
    private readonly patientRepository: PatientRepository,
    private readonly serviceRepository: ServiceRepository,
  ) {}

  async execute(input: { organizationId: string; day: Date }): Promise<TodayAppointmentDto[]> {
    const [appointments, patients, services] = await Promise.all([
      this.appointmentRepository.listByDay(input.organizationId, input.day),
      this.patientRepository.listByOrganization(input.organizationId),
      this.serviceRepository.listByOrganization(input.organizationId),
    ])

    return appointments
      .sort((left, right) => left.startAt.getTime() - right.startAt.getTime())
      .map((appointment) => ({
        id: appointment.id,
        patientName: patients.find((patient) => patient.id === appointment.patientId)?.fullName ?? 'Paciente desconocido',
        serviceName: services.find((service) => service.id === appointment.serviceId)?.name ?? 'Servicio desconocido',
        startAt: appointment.startAt,
        endAt: appointment.endAt,
        status: appointment.status,
        isUrgent: appointment.isUrgent,
      }))
  }
}
