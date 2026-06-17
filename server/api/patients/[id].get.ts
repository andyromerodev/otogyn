import { requireAuthorizedUser } from '../../utils/authorization'
import { handleApiError } from '../../utils/handle-api-error'
import { serverServiceLocator } from '../../utils/server-service-locator'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireAuthorizedUser(event, 'patients:read')
    const patientId = getRouterParam(event, 'id')

    if (!patientId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Patient id is required.',
      })
    }

    return await serverServiceLocator.patients.getPatientDetailUseCase.execute({
      patientId,
      organizationId: session.organizationId,
    })
  } catch (error) {
    handleApiError(error)
  }
})
