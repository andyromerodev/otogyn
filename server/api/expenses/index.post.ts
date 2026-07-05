import { expenseSchema } from '../../../src/presentation/validators/expense'
import { requireAuthorizedUser } from '../../utils/authorization'
import { handleApiError } from '../../utils/handle-api-error'
import { serverServiceLocator } from '../../utils/server-service-locator'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireAuthorizedUser(event, 'finances:write')
    const input = expenseSchema.parse(await readBody(event))

    return await serverServiceLocator.finances.createExpenseUseCase.execute({
      organizationId: session.organizationId,
      createdBy: session.userId,
      categoryId: input.categoryId,
      amount: input.amount,
      description: input.description,
      expenseDate: input.expenseDate,
      notes: input.notes ?? null,
    })
  } catch (error) {
    handleApiError(error)
  }
})
