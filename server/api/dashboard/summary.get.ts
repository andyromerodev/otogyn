import { requireAuthorizedUser } from '../../utils/authorization'
import { handleApiError } from '../../utils/handle-api-error'
import { serverServiceLocator } from '../../utils/server-service-locator'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireAuthorizedUser(event, 'dashboard:read')

    return await serverServiceLocator.dashboard.getDashboardSummaryUseCase.execute({
      organizationId: session.organizationId,
      day: new Date(),
    })
  } catch (error) {
    handleApiError(error)
  }
})
