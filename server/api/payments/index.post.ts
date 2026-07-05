import { paymentSchema } from '../../../src/presentation/validators/payment'
import { requireAuthorizedUser } from '../../utils/authorization'
import { handleApiError } from '../../utils/handle-api-error'
import { serverServiceLocator } from '../../utils/server-service-locator'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireAuthorizedUser(event, 'finances:write')
    const input = paymentSchema.parse(await readBody(event))

    return await serverServiceLocator.finances.createPaymentUseCase.execute({
      organizationId: session.organizationId,
      createdBy: session.userId,
      patientId: input.patientId ?? null,
      appointmentId: input.appointmentId ?? null,
      consultationId: input.consultationId ?? null,
      amount: input.amount,
      method: input.method,
      concept: input.concept,
      paidAt: input.paidAt,
      notes: input.notes ?? null,
    })
  } catch (error) {
    handleApiError(error)
  }
})
