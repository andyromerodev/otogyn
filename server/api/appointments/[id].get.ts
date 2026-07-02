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
    const appointmentId = getRouterParam(event, 'id')

    if (!appointmentId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Appointment id is required.',
      })
    }

    const item = await serverServiceLocator.appointments.getAppointmentDetailUseCase.execute({
      appointmentId,
      organizationId: session.organizationId,
    })

    return {
      ...item,
      startAt: item.startAt.toISOString(),
      endAt: item.endAt.toISOString(),
      timeLabel: `${toAppTimeLabel(item.startAt)} - ${toAppTimeLabel(item.endAt)}`,
      statusLabel: statusLabels[item.status],
    } satisfies TodayAppointmentViewModel
  } catch (error) {
    handleApiError(error)
  }
})
