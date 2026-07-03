import { startConsultationSchema } from '../../../src/presentation/validators/consultation'
import { requireAuthorizedUser } from '../../utils/authorization'
import { handleApiError } from '../../utils/handle-api-error'
import { serverServiceLocator } from '../../utils/server-service-locator'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireAuthorizedUser(event, 'consultations:write')
    const payload = await readBody(event)
    const input = startConsultationSchema.parse(payload)

    return await serverServiceLocator.consultations.startConsultationUseCase.execute({
      appointmentId: input.appointmentId,
      organizationId: session.organizationId,
      userId: session.userId,
    })
  } catch (error) {
    handleApiError(error)
  }
})
