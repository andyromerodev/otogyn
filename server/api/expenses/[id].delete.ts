import { requireAuthorizedUser } from '../../utils/authorization'
import { handleApiError } from '../../utils/handle-api-error'
import { serverServiceLocator } from '../../utils/server-service-locator'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireAuthorizedUser(event, 'finances:write')
    const expenseId = getRouterParam(event, 'id')

    if (!expenseId) {
      throw createError({ statusCode: 400, statusMessage: 'Expense id is required.' })
    }

    await serverServiceLocator.finances.deleteExpenseUseCase.execute({
      expenseId,
      organizationId: session.organizationId,
    })

    return { success: true }
  } catch (error) {
    handleApiError(error)
  }
})
