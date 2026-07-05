import { updatePaymentSchema } from '../../../src/presentation/validators/payment'
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

    const input = updatePaymentSchema.parse(await readBody(event))

    return await serverServiceLocator.finances.updatePaymentUseCase.execute({
      id: paymentId,
      organizationId: session.organizationId,
      patientId: input.patientId,
      appointmentId: input.appointmentId,
      consultationId: input.consultationId,
      amount: input.amount,
      method: input.method,
      concept: input.concept,
      paidAt: input.paidAt,
      notes: input.notes,
    })
  } catch (error) {
    handleApiError(error)
  }
})
