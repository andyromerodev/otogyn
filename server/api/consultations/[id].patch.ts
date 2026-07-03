import { updateConsultationSchema } from '../../../src/presentation/validators/consultation'
import { requireAuthorizedUser } from '../../utils/authorization'
import { handleApiError } from '../../utils/handle-api-error'
import { serverServiceLocator } from '../../utils/server-service-locator'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireAuthorizedUser(event, 'consultations:write')
    const consultationId = getRouterParam(event, 'id')

    if (!consultationId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Consultation id is required.',
      })
    }

    const payload = await readBody(event)
    const input = updateConsultationSchema.parse(payload)

    return await serverServiceLocator.consultations.updateConsultationUseCase.execute({
      consultationId,
      organizationId: session.organizationId,
      data: input,
    })
  } catch (error) {
    handleApiError(error)
  }
})
