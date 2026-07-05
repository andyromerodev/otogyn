import { updateExpenseSchema } from '../../../src/presentation/validators/expense'
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

    const input = updateExpenseSchema.parse(await readBody(event))

    return await serverServiceLocator.finances.updateExpenseUseCase.execute({
      id: expenseId,
      organizationId: session.organizationId,
      categoryId: input.categoryId,
      amount: input.amount,
      description: input.description,
      expenseDate: input.expenseDate,
      notes: input.notes,
    })
  } catch (error) {
    handleApiError(error)
  }
})
