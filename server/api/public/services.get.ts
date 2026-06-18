import { handleApiError } from '../../utils/handle-api-error'
import { getPublicContext } from '../../utils/get-public-context'
import { serverServiceLocator } from '../../utils/server-service-locator'

export default defineEventHandler(async () => {
  try {
    const { organizationId } = await getPublicContext()

    return await serverServiceLocator.booking.getPublicServicesUseCase.execute({ organizationId })
  } catch (error) {
    handleApiError(error)
  }
})
