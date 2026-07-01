import { requireAuthorizedUser } from '../../../../utils/authorization'
import { handleApiError } from '../../../../utils/handle-api-error'
import { serverServiceLocator } from '../../../../utils/server-service-locator'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireAuthorizedUser(event, 'pre_evaluation_forms:read')
    const formId = getRouterParam(event, 'id')
    const key = getRouterParam(event, 'key')

    if (!formId || !key) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Pre-evaluation form id and attachment key are required.',
      })
    }

    const form = await serverServiceLocator.preEvaluationForms.getPreEvaluationFormDetailUseCase.execute(
      { formId, organizationId: session.organizationId },
    )

    if (!form.attachmentKeys.includes(key)) {
      throw createError({ statusCode: 404, statusMessage: 'Attachment not found.' })
    }

    const attachment = await serverServiceLocator.preEvaluationForms.attachmentStorage.get(key)

    if (!attachment) {
      throw createError({ statusCode: 404, statusMessage: 'Attachment not found.' })
    }

    setResponseHeader(event, 'Content-Type', attachment.contentType)
    return attachment.data
  } catch (error) {
    handleApiError(error)
  }
})
