import { requireAuthorizedUser } from '../../utils/authorization'
import { handleApiError } from '../../utils/handle-api-error'
import { serverServiceLocator } from '../../utils/server-service-locator'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireAuthorizedUser(event, 'finances:read')

    return await serverServiceLocator.finances.getFinanceSummaryUseCase.execute({
      organizationId: session.organizationId,
      referenceDate: new Date(),
    })
  } catch (error) {
    handleApiError(error)
  }
})
