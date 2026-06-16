import { GetDashboardSummaryUseCase } from '../../../src/application/use-cases/get-dashboard-summary'
import { DrizzleAppointmentRepository } from '../../../src/infrastructure/repositories/drizzle-appointment-repository'
import { getCurrentUser } from '../../utils/get-current-user'
import { handleApiError } from '../../utils/handle-api-error'

export default defineEventHandler(async (event) => {
  try {
    const session = await getCurrentUser(event)
    const useCase = new GetDashboardSummaryUseCase(new DrizzleAppointmentRepository())

    return await useCase.execute({
      organizationId: session.organizationId,
      day: new Date(),
    })
  } catch (error) {
    handleApiError(error)
  }
})
