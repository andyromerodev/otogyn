import { inventoryItemUpdateSchema } from '../../../../src/presentation/validators/inventory'
import { requireAuthorizedUser } from '../../../utils/authorization'
import { handleApiError } from '../../../utils/handle-api-error'
import { serverServiceLocator } from '../../../utils/server-service-locator'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireAuthorizedUser(event, 'inventory:manage')
    const input = inventoryItemUpdateSchema.parse(await readBody(event))
    return await serverServiceLocator.inventory.updateItemUseCase.execute({ organizationId: session.organizationId, id: getRouterParam(event, 'id')!, ...input })
  } catch (error) { handleApiError(error) }
})
