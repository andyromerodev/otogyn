import { requireAuthorizedUser } from '../../utils/authorization'
import { handleApiError } from '../../utils/handle-api-error'
import { serverServiceLocator } from '../../utils/server-service-locator'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireAuthorizedUser(event, 'inventory:read')
    return await serverServiceLocator.inventory.getSummaryUseCase.execute({ organizationId: session.organizationId })
  } catch (error) { handleApiError(error) }
})
