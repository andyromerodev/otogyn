import { getQuery } from 'h3'
import { inventoryListQuerySchema } from '../../../../src/presentation/validators/inventory'
import { requireAuthorizedUser } from '../../../utils/authorization'
import { handleApiError } from '../../../utils/handle-api-error'
import { serverServiceLocator } from '../../../utils/server-service-locator'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireAuthorizedUser(event, 'inventory:read')
    const query = inventoryListQuerySchema.parse(getQuery(event))
    return await serverServiceLocator.inventory.listItemsUseCase.execute({ organizationId: session.organizationId, ...query })
  } catch (error) { handleApiError(error) }
})
