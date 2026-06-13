import type { TodayAppointmentViewModel } from '../../../src/presentation/view-models/dashboard'
import { getCurrentUser } from '../../utils/get-current-user'
import { handleApiError } from '../../utils/handle-api-error'
import { mockRuntime } from '../../utils/mock-runtime'

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
    const session = await getCurrentUser(event)
    const items = await mockRuntime.useCases.getTodayAppointments.execute({
      organizationId: session.organizationId,
      day: new Date(),
    })

    return items.map((item): TodayAppointmentViewModel => ({
      ...item,
      timeLabel: `${item.startAt.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })} - ${item.endAt.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}`,
      statusLabel: statusLabels[item.status],
    }))
  } catch (error) {
    handleApiError(error)
  }
})
