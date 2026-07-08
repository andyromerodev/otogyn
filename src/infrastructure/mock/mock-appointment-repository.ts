import type { Appointment } from '../../domain/entities/appointment'
import type {
  AppointmentListPageQuery,
  AppointmentListPageResult,
  AppointmentRepository,
} from '../../domain/repositories/appointment-repository'
import { activeAppointmentStatuses } from '../../domain/value-objects/appointment-status'

export class MockAppointmentRepository implements AppointmentRepository {
  constructor(private readonly appointments: Appointment[]) {}

  async findById(appointmentId: string): Promise<Appointment | null> {
    return this.appointments.find((appointment) => appointment.id === appointmentId) ?? null
  }

  async listPage(input: AppointmentListPageQuery): Promise<AppointmentListPageResult> {
    const pageSize = Math.min(Math.max(input.pageSize, 1), 50)
    const allItems = this.appointments.filter((appointment) => appointment.organizationId === input.organizationId)
    const search = input.search.trim().toLowerCase()
    const filtered = allItems
      .filter((appointment) => !input.startAtFrom || appointment.startAt >= input.startAtFrom)
      .filter((appointment) => !input.startAtTo || appointment.startAt < input.startAtTo)
      .filter((appointment) => {
        if (!search) return true
        return [appointment.reason, appointment.notes, appointment.patientId, appointment.serviceId]
          .some((value) => value?.toLowerCase().includes(search))
      })
      .sort((left, right) => right.startAt.getTime() - left.startAt.getTime())

    const total = filtered.length
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    const page = Math.min(Math.max(input.page, 1), totalPages)
    const start = (page - 1) * pageSize

    return {
      items: filtered.slice(start, start + pageSize).map((appointment) => ({
        ...appointment,
        patientName: appointment.patientId,
        serviceName: appointment.serviceId,
        paymentStatus: 'pending',
        linkedPayment: null,
      })),
      total,
      allTotal: allItems.length,
      page,
      pageSize,
      totalPages,
    }
  }

  async listByDay(organizationId: string, day: Date): Promise<Appointment[]> {
    const start = new Date(day)
    start.setHours(0, 0, 0, 0)
    const end = new Date(day)
    end.setHours(23, 59, 59, 999)

    return this.appointments.filter(
      (appointment) =>
        appointment.organizationId === organizationId &&
        appointment.startAt >= start &&
        appointment.startAt <= end,
    )
  }

  async listCollisions(
    organizationId: string,
    startAt: Date,
    endAt: Date,
    ignoredAppointmentId?: string,
  ): Promise<Appointment[]> {
    return this.appointments.filter(
      (appointment) =>
        appointment.organizationId === organizationId &&
        appointment.id !== ignoredAppointmentId &&
        activeAppointmentStatuses.includes(appointment.status) &&
        appointment.startAt < endAt &&
        appointment.endAt > startAt,
    )
  }

  async listByRange(organizationId: string, start: Date, end: Date): Promise<Appointment[]> {
    return this.appointments.filter(
      (appointment) =>
        appointment.organizationId === organizationId &&
        appointment.startAt >= start &&
        appointment.startAt < end,
    )
  }

  async save(appointment: Appointment): Promise<Appointment> {
    const index = this.appointments.findIndex((item) => item.id === appointment.id)

    if (index >= 0) {
      this.appointments[index] = appointment
    } else {
      this.appointments.push(appointment)
    }

    return appointment
  }

  async saveWithLock(appointment: Appointment): Promise<Appointment> {
    return this.save(appointment)
  }
}
