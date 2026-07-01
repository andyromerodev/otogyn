import { linkPreEvaluationFormSchema } from '../../../../src/presentation/validators/pre-evaluation-form'
import { requireAuthorizedUser } from '../../../utils/authorization'
import { handleApiError } from '../../../utils/handle-api-error'
import { serverServiceLocator } from '../../../utils/server-service-locator'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireAuthorizedUser(event, 'pre_evaluation_forms:write')
    const formId = getRouterParam(event, 'id')

    if (!formId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Pre-evaluation form id is required.',
      })
    }

    const payload = await readBody(event)
    const input = linkPreEvaluationFormSchema.parse(payload)

    return await serverServiceLocator.preEvaluationForms.linkPreEvaluationFormToPatientUseCase.execute({
      formId,
      patientId: input.patientId,
      organizationId: session.organizationId,
    })
  } catch (error) {
    handleApiError(error)
  }
})
