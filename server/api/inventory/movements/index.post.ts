import { inventoryMovementSchema } from '../../../../src/presentation/validators/inventory'
import { requireAuthorizedUser } from '../../../utils/authorization'
import { handleApiError } from '../../../utils/handle-api-error'
import { serverServiceLocator } from '../../../utils/server-service-locator'

export default defineEventHandler(async (event) => {
  try {
    const input = inventoryMovementSchema.parse(await readBody(event))
    const action = input.type.startsWith('adjustment') ? 'inventory:manage' : 'inventory:operate'
    const session = await requireAuthorizedUser(event, action)
    return await serverServiceLocator.inventory.recordMovementUseCase.execute({ organizationId: session.organizationId, createdBy: session.userId, ...input })
  } catch (error) { handleApiError(error) }
})
