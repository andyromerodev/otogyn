import { requireAuthorizedUser } from '../../utils/authorization'
import { handleApiError } from '../../utils/handle-api-error'
import { serverServiceLocator } from '../../utils/server-service-locator'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireAuthorizedUser(event, 'pre_evaluation_forms:read')
    const formId = getRouterParam(event, 'id')

    if (!formId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Pre-evaluation form id is required.',
      })
    }

    return await serverServiceLocator.preEvaluationForms.getPreEvaluationFormDetailUseCase.execute({
      formId,
      organizationId: session.organizationId,
    })
  } catch (error) {
    handleApiError(error)
  }
})
