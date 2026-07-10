import { getQuery } from 'h3'
import { handleApiError } from '../../utils/handle-api-error'
import { getPublicContext } from '../../utils/get-public-context'
import { serverServiceLocator } from '../../utils/server-service-locator'
import { enforcePublicRateLimit } from '../../utils/public-security'
import { publicServicesQuerySchema } from '../../../src/presentation/validators/service'

export default defineEventHandler(async (event) => {
  try {
    await enforcePublicRateLimit(event, 'public-services')
    const { organizationId } = await getPublicContext()
    const query = publicServicesQuerySchema.parse(getQuery(event))

    return await serverServiceLocator.booking.getPublicServicesUseCase.execute({
      organizationId,
      search: query.search,
      page: query.page,
      pageSize: query.pageSize,
    })
  } catch (error) {
    handleApiError(error)
  }
})
