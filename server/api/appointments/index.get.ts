import { getQuery } from 'h3'
import { toAppTimeLabel } from '../../../src/application/utils/date/local-date'
import { appointmentListQuerySchema } from '../../../src/presentation/validators/appointment'
import type { TodayAppointmentViewModel } from '../../../src/presentation/view-models/dashboard'
import { requireAuthorizedUser } from '../../utils/authorization'
import { handleApiError } from '../../utils/handle-api-error'
import { serverServiceLocator } from '../../utils/server-service-locator'

const statusLabels: Record<TodayAppointmentViewModel['status'], string> = {
  scheduled: 'Programada',
  confirmed: 'Confirmada',
  checked_in: 'En sala',
  in_progress: 'En consulta',
  completed: 'Completada',
  cancelled: 'Cancelada',
  no_show: 'No asistio',
}

export default defineEventHandler(async (event) => {
  try {
    const session = await requireAuthorizedUser(event, 'appointments:read')
    const query = appointmentListQuerySchema.parse(getQuery(event))
    const result = await serverServiceLocator.appointments.listAppointmentsUseCase.execute({
      organizationId: session.organizationId,
      search: query.search,
      filter: query.filter,
      page: query.page,
      pageSize: query.pageSize,
    })

    return {
      ...result,
      items: result.items.map((item): TodayAppointmentViewModel => ({
        id: item.id,
        patientId: item.patientId,
        serviceId: item.serviceId,
        professionalId: item.professionalId,
        patientName: item.patientName,
        serviceName: item.serviceName,
        startAt: item.startAt.toISOString(),
        endAt: item.endAt.toISOString(),
        timeLabel: `${toAppTimeLabel(item.startAt)} - ${toAppTimeLabel(item.endAt)}`,
        status: item.status,
        statusLabel: statusLabels[item.status],
        isUrgent: item.isUrgent,
        reason: item.reason,
        notes: item.notes,
      })),
    }
  } catch (error) {
    handleApiError(error)
  }
})
