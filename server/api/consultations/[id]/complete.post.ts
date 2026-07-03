import { requireAuthorizedUser } from '../../../utils/authorization'
import { handleApiError } from '../../../utils/handle-api-error'
import { serverServiceLocator } from '../../../utils/server-service-locator'

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

    return await serverServiceLocator.consultations.completeConsultationUseCase.execute({
      consultationId,
      organizationId: session.organizationId,
      updatedBy: session.userId,
      actorRole: session.role,
    })
  } catch (error) {
    handleApiError(error)
  }
})
