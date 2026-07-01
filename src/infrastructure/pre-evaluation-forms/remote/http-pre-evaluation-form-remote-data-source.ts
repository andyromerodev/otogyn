import type {
  CreatePreEvaluationFormInput,
  CreatePreEvaluationFormResult,
} from '../../../application/dto/pre-evaluation-form'
import type { PreEvaluationFormRemoteDataSource } from './pre-evaluation-form-remote-data-source'

export class HttpPreEvaluationFormRemoteDataSource implements PreEvaluationFormRemoteDataSource {
  submit(input: CreatePreEvaluationFormInput): Promise<CreatePreEvaluationFormResult> {
    return $fetch<CreatePreEvaluationFormResult>('/api/public/pre-evaluacion' as string, {
      method: 'POST',
      body: input,
    })
  }

  uploadAttachment(file: File): Promise<{ key: string }> {
    const formData = new FormData()
    formData.append('file', file)

    return $fetch<{ key: string }>('/api/public/pre-evaluacion/upload' as string, {
      method: 'POST',
      body: formData,
    })
  }
}
