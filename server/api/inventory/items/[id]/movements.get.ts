import { getQuery } from 'h3'
import { inventoryMovementListQuerySchema } from '../../../../../src/presentation/validators/inventory'
import { requireAuthorizedUser } from '../../../../utils/authorization'
import { handleApiError } from '../../../../utils/handle-api-error'
import { serverServiceLocator } from '../../../../utils/server-service-locator'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireAuthorizedUser(event, 'inventory:read')
    const query = inventoryMovementListQuerySchema.parse(getQuery(event))
    return await serverServiceLocator.inventory.listMovementsUseCase.execute({ organizationId: session.organizationId, itemId: getRouterParam(event, 'id')!, ...query })
  } catch (error) { handleApiError(error) }
})
