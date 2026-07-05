import { expenseCategorySchema } from '../../../src/presentation/validators/expense'
import { requireAuthorizedUser } from '../../utils/authorization'
import { handleApiError } from '../../utils/handle-api-error'
import { serverServiceLocator } from '../../utils/server-service-locator'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireAuthorizedUser(event, 'finances:write')
    const input = expenseCategorySchema.parse(await readBody(event))

    return await serverServiceLocator.finances.createExpenseCategoryUseCase.execute({
      organizationId: session.organizationId,
      name: input.name,
    })
  } catch (error) {
    handleApiError(error)
  }
})
