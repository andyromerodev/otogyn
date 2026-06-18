import { BusinessRuleError } from '../../domain/errors/business-rule-error'
import type { Appointment } from '../../domain/entities/appointment'
import type { AppointmentRepository } from '../../domain/repositories/appointment-repository'
import type { AvailabilityRepository } from '../../domain/repositories/availability-repository'
import type { PatientRepository } from '../../domain/repositories/patient-repository'
import type { ServiceRepository } from '../../domain/repositories/service-repository'

export class ScheduleAppointmentUseCase {
  constructor(
    private readonly appointmentRepository: AppointmentRepository,
    private readonly patientRepository: PatientRepository,
    private readonly serviceRepository: ServiceRepository,
    private readonly availabilityRepository: AvailabilityRepository,
  ) {}

  async execute(appointment: Appointment): Promise<Appointment> {
    const [patient, service, collisions, weeklyAvailability, blockedSlots] = await Promise.all([
      this.patientRepository.findById(appointment.patientId),
      this.serviceRepository.findById(appointment.serviceId),
      this.appointmentRepository.listCollisions(
        appointment.organizationId,
        appointment.startAt,
        appointment.endAt,
        appointment.id,
      ),
      this.availabilityRepository.listWeeklyAvailability(appointment.organizationId),
      this.availabilityRepository.listBlockedSlots(appointment.organizationId, appointment.startAt),
    ])

    if (!patient) {
      throw new BusinessRuleError('No puede existir una cita sin paciente.')
    }

    if (!service) {
      throw new BusinessRuleError('No puede existir una cita sin servicio.')
    }

    const weekday = appointment.startAt.getDay()
    const slotLabel = this.toTimeLabel(appointment.startAt)
    const endLabel = this.toTimeLabel(appointment.endAt)
    const matchesAvailability = weeklyAvailability.some(
      (item) =>
        item.weekday === weekday &&
        item.isActive &&
        item.startTime <= slotLabel &&
        item.endTime >= endLabel,
    )

    if (!matchesAvailability) {
      throw new BusinessRuleError('No puede existir una cita fuera del horario disponible.')
    }

    const overlapsBlockedSlot = blockedSlots.some(
      (blockedSlot) =>
        appointment.startAt < blockedSlot.endsAt &&
        appointment.endAt > blockedSlot.startsAt,
    )

    if (overlapsBlockedSlot) {
      throw new BusinessRuleError('La franja seleccionada no esta disponible.')
    }

    if (collisions.length > 0) {
      throw new BusinessRuleError('No puede existir una cita que choque con otra cita activa.')
    }

    return this.appointmentRepository.saveWithLock(appointment)
  }

  private toTimeLabel(date: Date) {
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  }
}
