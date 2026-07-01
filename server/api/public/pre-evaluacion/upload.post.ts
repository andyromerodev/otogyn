import { BusinessRuleError } from '../../../../src/domain/errors/business-rule-error'
import { handleApiError } from '../../../utils/handle-api-error'
import { serverServiceLocator } from '../../../utils/server-service-locator'

const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024

const detectImageContentType = (data: Buffer): string | null => {
  if (data.length >= 3 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) {
    return 'image/jpeg'
  }

  if (
    data.length >= 4 &&
    data[0] === 0x89 &&
    data[1] === 0x50 &&
    data[2] === 0x4e &&
    data[3] === 0x47
  ) {
    return 'image/png'
  }

  return null
}

export default defineEventHandler(async (event) => {
  try {
    const parts = await readMultipartFormData(event)
    const filePart = parts?.find((part) => part.name === 'file' && part.data)

    if (!filePart) {
      throw new BusinessRuleError('No se recibio ningun archivo.')
    }

    if (filePart.data.length > MAX_FILE_SIZE_BYTES) {
      throw new BusinessRuleError('El archivo excede el tamano maximo permitido (8MB).')
    }

    const contentType = detectImageContentType(filePart.data)
    if (!contentType) {
      throw new BusinessRuleError('Solo se permiten imagenes JPG o PNG.')
    }

    return await serverServiceLocator.preEvaluationForms.uploadPreEvaluationAttachmentUseCase.execute(
      { data: filePart.data, contentType },
    )
  } catch (error) {
    handleApiError(error)
  }
})
