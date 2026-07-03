import { requireAuthorizedUser } from '../../../../utils/authorization'
import { handleApiError } from '../../../../utils/handle-api-error'
import { serverServiceLocator } from '../../../../utils/server-service-locator'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireAuthorizedUser(event, 'consultations:read')
    const consultationId = getRouterParam(event, 'id')
    const key = getRouterParam(event, 'key')

    if (!consultationId || !key) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Consultation id and attachment key are required.',
      })
    }

    const consultation = await serverServiceLocator.repositories.consultationRepository.findById(
      consultationId,
      session.organizationId,
    )

    if (!consultation || !consultation.attachmentKeys.includes(key)) {
      throw createError({ statusCode: 404, statusMessage: 'Attachment not found.' })
    }

    const attachment = await serverServiceLocator.consultations.attachmentStorage.get(key)

    if (!attachment) {
      throw createError({ statusCode: 404, statusMessage: 'Attachment not found.' })
    }

    setResponseHeader(event, 'Content-Type', attachment.contentType)
    return attachment.data
  } catch (error) {
    handleApiError(error)
  }
})
