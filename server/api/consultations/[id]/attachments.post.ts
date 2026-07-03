import { BusinessRuleError } from '../../../../src/domain/errors/business-rule-error'
import { requireAuthorizedUser } from '../../../utils/authorization'
import { handleApiError } from '../../../utils/handle-api-error'
import { serverServiceLocator } from '../../../utils/server-service-locator'

const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024
const MAX_ATTACHMENTS_PER_CONSULTATION = 10

const EXTENSION_BY_CONTENT_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
}

const detectContentType = (data: Buffer): string | null => {
  if (data.length >= 3 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) {
    return 'image/jpeg'
  }

  if (
    data.length >= 8 &&
    data[0] === 0x89 &&
    data[1] === 0x50 &&
    data[2] === 0x4e &&
    data[3] === 0x47 &&
    data[4] === 0x0d &&
    data[5] === 0x0a &&
    data[6] === 0x1a &&
    data[7] === 0x0a
  ) {
    return 'image/png'
  }

  if (
    data.length >= 12 &&
    data[0] === 0x52 &&
    data[1] === 0x49 &&
    data[2] === 0x46 &&
    data[3] === 0x46 &&
    data[8] === 0x57 &&
    data[9] === 0x45 &&
    data[10] === 0x42 &&
    data[11] === 0x50
  ) {
    return 'image/webp'
  }

  if (
    data.length >= 5 &&
    data[0] === 0x25 &&
    data[1] === 0x50 &&
    data[2] === 0x44 &&
    data[3] === 0x46 &&
    data[4] === 0x2d
  ) {
    return 'application/pdf'
  }

  return null
}

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

    const consultation = await serverServiceLocator.repositories.consultationRepository.findById(
      consultationId,
      session.organizationId,
    )

    if (!consultation) {
      throw createError({ statusCode: 404, statusMessage: 'Consultation not found.' })
    }

    if (consultation.status === 'completed') {
      throw new BusinessRuleError('No se pueden agregar adjuntos a una consulta completada.')
    }

    if (consultation.attachmentKeys.length >= MAX_ATTACHMENTS_PER_CONSULTATION) {
      throw new BusinessRuleError('Se alcanzo el numero maximo de adjuntos para esta consulta.')
    }

    const parts = await readMultipartFormData(event)
    const filePart = parts?.find((part) => part.name === 'file' && part.data)

    if (!filePart) {
      throw new BusinessRuleError('No se recibio ningun archivo.')
    }

    if (filePart.data.length > MAX_FILE_SIZE_BYTES) {
      throw new BusinessRuleError('El archivo excede el tamano maximo permitido (8MB).')
    }

    const contentType = detectContentType(filePart.data)
    if (!contentType) {
      throw new BusinessRuleError('Solo se permiten archivos JPG, PNG, WEBP o PDF.')
    }

    const extension = EXTENSION_BY_CONTENT_TYPE[contentType]!
    const key = `${crypto.randomUUID()}.${extension}`

    await serverServiceLocator.consultations.attachmentStorage.store(
      key,
      filePart.data,
      contentType,
    )

    const updatedConsultation =
      await serverServiceLocator.consultations.updateConsultationUseCase.execute({
        consultationId,
        organizationId: session.organizationId,
        data: {
          attachmentKeys: [...consultation.attachmentKeys, key],
        },
      })

    return { key, attachmentKeys: updatedConsultation.attachmentKeys }
  } catch (error) {
    handleApiError(error)
  }
})
