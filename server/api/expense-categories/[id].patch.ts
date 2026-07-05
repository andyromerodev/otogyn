import { updateExpenseCategorySchema } from '../../../src/presentation/validators/expense'
import { requireAuthorizedUser } from '../../utils/authorization'
import { handleApiError } from '../../utils/handle-api-error'
import { serverServiceLocator } from '../../utils/server-service-locator'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireAuthorizedUser(event, 'finances:write')
    const categoryId = getRouterParam(event, 'id')

    if (!categoryId) {
      throw createError({ statusCode: 400, statusMessage: 'Category id is required.' })
    }

    const input = updateExpenseCategorySchema.parse(await readBody(event))

    return await serverServiceLocator.finances.updateExpenseCategoryUseCase.execute({
      id: categoryId,
      organizationId: session.organizationId,
      name: input.name,
      isActive: input.isActive,
    })
  } catch (error) {
    handleApiError(error)
  }
})
