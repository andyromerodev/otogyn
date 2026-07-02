import type { CalendarWeekDto } from '../../dto/calendar'
import type { AppointmentRepository } from '../../../domain/repositories/appointment-repository'
import type { AvailabilityRepository } from '../../../domain/repositories/availability-repository'
import type { PatientRepository } from '../../../domain/repositories/patient-repository'
import type { ServiceRepository } from '../../../domain/repositories/service-repository'
import { activeAppointmentStatuses } from '../../../domain/value-objects/appointment-status'
import { addAppDays, formatLocalDate, getAppDayBounds, getAppWeekday } from '../../utils/date/local-date'
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

function getMondayOfWeek(date: Date): Date {
  const day = getAppWeekday(date)
  const diff = day === 0 ? -6 : 1 - day
  return addAppDays(date, diff)
}

export class GetCalendarWeekUseCase {
  constructor(
    private readonly appointmentRepository: AppointmentRepository,
    private readonly availabilityRepository: AvailabilityRepository,
    private readonly patientRepository: PatientRepository,
    private readonly serviceRepository: ServiceRepository,
  ) {}

  async execute(input: { organizationId: string; referenceDate: Date }): Promise<CalendarWeekDto> {
    const { organizationId, referenceDate } = input

    const weekStart = getMondayOfWeek(referenceDate)
    const weekEnd = getAppDayBounds(addAppDays(weekStart, 6)).end

    const [appointments, weeklyAvailability, blockedSlots, patients, services] = await Promise.all([
      this.appointmentRepository.listByRange(organizationId, weekStart, weekEnd),
      this.availabilityRepository.listWeeklyAvailability(organizationId),
      this.availabilityRepository.listBlockedSlotsRange(organizationId, weekStart, weekEnd),
      this.patientRepository.listByOrganization(organizationId),
      this.serviceRepository.listByOrganization(organizationId),
    ])

    const days = Array.from({ length: 7 }, (_, i) => {
      const date = addAppDays(weekStart, i)
      const { end: nextDay } = getAppDayBounds(date)

      const weekday = getAppWeekday(date)

      const dayAppointments = appointments
        .filter((a) => a.startAt >= date && a.startAt <= nextDay)
        .sort((a, b) => a.startAt.getTime() - b.startAt.getTime())

      const dayBlocked = blockedSlots.filter(
        (b) => b.startsAt < nextDay && b.endsAt > date,
      )

      const activeWindows = weeklyAvailability
        .filter((a) => a.weekday === weekday && a.isActive)
        .map((a) => ({ startTime: a.startTime, endTime: a.endTime }))

      const busyIntervals = [
        ...dayAppointments
          .filter((a) => (activeAppointmentStatuses as string[]).includes(a.status))
          .map((a) => ({ startsAt: a.startAt, endsAt: a.endAt })),
        ...dayBlocked.map((b) => ({ startsAt: b.startsAt, endsAt: b.endsAt })),
      ]

      return {
        date: formatLocalDate(date),
        weekday,
        isWorkday: activeWindows.length > 0,
        availabilityWindows: activeWindows,
        appointments: dayAppointments.map((a) => ({
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
        blockedSlots: dayBlocked.map((b) => ({
          id: b.id,
          startsAt: b.startsAt.toISOString(),
          endsAt: b.endsAt.toISOString(),
          reason: b.reason,
        })),
        freeSlots: computeFreeSlots(date, activeWindows, busyIntervals),
      }
    })

    return {
      weekStart: formatLocalDate(weekStart),
      weekEnd: formatLocalDate(weekEnd),
      days,
    }
  }
}
