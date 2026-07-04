import { requireAuthorizedUser } from '../../../utils/authorization'
import { handleApiError } from '../../../utils/handle-api-error'
import { serverServiceLocator } from '../../../utils/server-service-locator'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireAuthorizedUser(event, 'consultations:write')
    const id = getRouterParam(event, 'id')

    if (!id) {
      throw createError({ statusCode: 400, statusMessage: 'Template id is required.' })
    }

    await serverServiceLocator.consultations.deleteTreatmentTemplateUseCase.execute({
      id,
      organizationId: session.organizationId,
    })

    return { success: true }
  } catch (error) {
    handleApiError(error)
  }
})
