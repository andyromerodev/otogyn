import { requireAuthorizedUser } from '../../utils/authorization'
import { handleApiError } from '../../utils/handle-api-error'
import { serverServiceLocator } from '../../utils/server-service-locator'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireAuthorizedUser(event, 'finances:write')
    const paymentId = getRouterParam(event, 'id')

    if (!paymentId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Payment id is required.',
      })
    }

    await serverServiceLocator.finances.deletePaymentUseCase.execute({
      paymentId,
      organizationId: session.organizationId,
    })

    return {
      success: true,
    }
  } catch (error) {
    handleApiError(error)
  }
})
