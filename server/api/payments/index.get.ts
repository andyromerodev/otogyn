import { getQuery } from 'h3'
import { paymentListQuerySchema } from '../../../src/presentation/validators/payment'
import { requireAuthorizedUser } from '../../utils/authorization'
import { handleApiError } from '../../utils/handle-api-error'
import { serverServiceLocator } from '../../utils/server-service-locator'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireAuthorizedUser(event, 'finances:read')
    const query = paymentListQuerySchema.parse(getQuery(event))

    return await serverServiceLocator.finances.listPaymentsUseCase.execute({
      organizationId: session.organizationId,
      patientId: query.patientId,
      method: query.method,
      paidAtFrom: query.paidAtFrom,
      paidAtTo: query.paidAtTo,
      page: query.page,
      pageSize: query.pageSize,
      search: query.search,
    })
  } catch (error) {
    handleApiError(error)
  }
})
