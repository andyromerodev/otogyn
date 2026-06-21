import type { CalendarDayDto } from '../../dto/calendar'
import type { AppointmentRepository } from '../../../domain/repositories/appointment-repository'
import type { AvailabilityRepository } from '../../../domain/repositories/availability-repository'
import type { PatientRepository } from '../../../domain/repositories/patient-repository'
import type { ServiceRepository } from '../../../domain/repositories/service-repository'
import { activeAppointmentStatuses } from '../../../domain/value-objects/appointment-status'
import { formatLocalDate } from '../../utils/date/local-date'
import { computeFreeSlots } from './free-slots'

const statusLabels: Record<string, string> = {
  scheduled: 'Programada',
  confirmed: 'Confirmada',
  checked_in: 'En sala',
  in_progress: 'En consulta',
  completed: 'Completada',
  cancelled: 'Cancelada',
  no_show: 'No asistio',
}

export class GetCalendarDayUseCase {
  constructor(
    private readonly appointmentRepository: AppointmentRepository,
    private readonly availabilityRepository: AvailabilityRepository,
    private readonly patientRepository: PatientRepository,
    private readonly serviceRepository: ServiceRepository,
  ) {}

  async execute(input: { organizationId: string; date: Date }): Promise<CalendarDayDto> {
    const { organizationId, date } = input

    const dayStart = new Date(date)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(date)
    dayEnd.setHours(23, 59, 59, 999)

    const [appointments, weeklyAvailability, blockedSlots, patients, services] = await Promise.all([
      this.appointmentRepository.listByDay(organizationId, date),
      this.availabilityRepository.listWeeklyAvailability(organizationId),
      this.availabilityRepository.listBlockedSlots(organizationId, date),
      this.patientRepository.listByOrganization(organizationId),
      this.serviceRepository.listByOrganization(organizationId),
    ])

    const weekday = date.getDay()
    const activeWindows = weeklyAvailability
      .filter((a) => a.weekday === weekday && a.isActive)
      .map((a) => ({ startTime: a.startTime, endTime: a.endTime }))

    const busyIntervals = [
      ...appointments
        .filter((a) => (activeAppointmentStatuses as string[]).includes(a.status))
        .map((a) => ({ startsAt: a.startAt, endsAt: a.endAt })),
      ...blockedSlots.map((b) => ({ startsAt: b.startsAt, endsAt: b.endsAt })),
    ]

    return {
      date: formatLocalDate(date),
      weekday,
      isWorkday: activeWindows.length > 0,
      availabilityWindows: activeWindows,
      appointments: appointments
        .sort((a, b) => a.startAt.getTime() - b.startAt.getTime())
        .map((a) => ({
          id: a.id,
          patientName: patients.find((p) => p.id === a.patientId)?.fullName ?? 'Paciente desconocido',
          serviceName: services.find((s) => s.id === a.serviceId)?.name ?? 'Servicio desconocido',
          startAt: a.startAt.toISOString(),
          endAt: a.endAt.toISOString(),
          durationMinutes: Math.round((a.endAt.getTime() - a.startAt.getTime()) / 60000),
          status: a.status,
          statusLabel: statusLabels[a.status] ?? a.status,
          isUrgent: a.isUrgent,
        })),
      blockedSlots: blockedSlots.map((b) => ({
        id: b.id,
        startsAt: b.startsAt.toISOString(),
        endsAt: b.endsAt.toISOString(),
        reason: b.reason,
      })),
      freeSlots: computeFreeSlots(dayStart, activeWindows, busyIntervals),
    }
  }
}
