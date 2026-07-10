import { getQuery } from 'h3'
import { expenseListQuerySchema } from '../../../src/presentation/validators/expense'
import { requireAuthorizedUser } from '../../utils/authorization'
import { handleApiError } from '../../utils/handle-api-error'
import { serverServiceLocator } from '../../utils/server-service-locator'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireAuthorizedUser(event, 'finances:read')
    const query = expenseListQuerySchema.parse(getQuery(event))

    return await serverServiceLocator.finances.listExpensesUseCase.execute({
      organizationId: session.organizationId,
      categoryId: query.categoryId,
      expenseDateFrom: query.expenseDateFrom,
      expenseDateTo: query.expenseDateTo,
      page: query.page,
      pageSize: query.pageSize,
      search: query.search,
    })
  } catch (error) {
    handleApiError(error)
  }
})
