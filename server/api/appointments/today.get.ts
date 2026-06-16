import { GetTodayAppointmentsUseCase } from '../../../src/application/use-cases/get-today-appointments'
import { DrizzleAppointmentRepository } from '../../../src/infrastructure/repositories/drizzle-appointment-repository'
import { DrizzlePatientRepository } from '../../../src/infrastructure/repositories/drizzle-patient-repository'
import { DrizzleServiceRepository } from '../../../src/infrastructure/repositories/drizzle-service-repository'
import type { TodayAppointmentViewModel } from '../../../src/presentation/view-models/dashboard'
import { getCurrentUser } from '../../utils/get-current-user'
import { handleApiError } from '../../utils/handle-api-error'

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
    const useCase = new GetTodayAppointmentsUseCase(
      new DrizzleAppointmentRepository(),
      new DrizzlePatientRepository(),
      new DrizzleServiceRepository(),
    )

    const items = await useCase.execute({
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
