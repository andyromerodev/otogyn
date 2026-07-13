import { inventorySupplierSchema } from '../../../../src/presentation/validators/inventory'
import { requireAuthorizedUser } from '../../../utils/authorization'
import { handleApiError } from '../../../utils/handle-api-error'
import { serverServiceLocator } from '../../../utils/server-service-locator'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireAuthorizedUser(event, 'inventory:manage')
    const input = inventorySupplierSchema.parse(await readBody(event))
    return await serverServiceLocator.inventory.createSupplierUseCase.execute({ organizationId: session.organizationId, ...input, email: input.email || null })
  } catch (error) { handleApiError(error) }
})
