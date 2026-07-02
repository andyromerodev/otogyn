import { toAppTimeLabel } from '../../../src/application/utils/date/local-date'
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
    const items = await serverServiceLocator.appointments.getTodayAppointmentsUseCase.execute({
      organizationId: session.organizationId,
      day: new Date(),
    })

    return items.map((item): TodayAppointmentViewModel => ({
      ...item,
      startAt: item.startAt.toISOString(),
      endAt: item.endAt.toISOString(),
      timeLabel: `${toAppTimeLabel(item.startAt)} - ${toAppTimeLabel(item.endAt)}`,
      statusLabel: statusLabels[item.status],
    }))
  } catch (error) {
    handleApiError(error)
  }
})
