import { getQuery } from 'h3'
import { appointmentDirectoryQuerySchema } from '../../../src/presentation/validators/appointment'
import { requireAuthorizedUser } from '../../utils/authorization'
import { handleApiError } from '../../utils/handle-api-error'
import { serverServiceLocator } from '../../utils/server-service-locator'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireAuthorizedUser(event, 'services:read')
    const query = appointmentDirectoryQuerySchema.parse(getQuery(event))

    return await serverServiceLocator.services.listServicesUseCase.execute({
      organizationId: session.organizationId,
      search: query.search,
    })
  } catch (error) {
    handleApiError(error)
  }
})
