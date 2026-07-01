import { BusinessRuleError } from '../../../domain/errors/business-rule-error'
import type { AttachmentStoragePort } from '../../ports/attachment-storage'

const ALLOWED_CONTENT_TYPES = new Set(['image/jpeg', 'image/png'])
const EXTENSION_BY_CONTENT_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
}

export class UploadPreEvaluationAttachmentUseCase {
  constructor(private readonly attachmentStorage: AttachmentStoragePort) {}

  async execute(input: { data: Buffer; contentType: string }): Promise<{ key: string }> {
    if (!ALLOWED_CONTENT_TYPES.has(input.contentType)) {
      throw new BusinessRuleError('Solo se permiten imagenes JPG o PNG.')
    }

    const extension = EXTENSION_BY_CONTENT_TYPE[input.contentType]
    const key = `${crypto.randomUUID()}.${extension}`

    await this.attachmentStorage.store(key, input.data, input.contentType)

    return { key }
  }
}
