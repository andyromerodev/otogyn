import type {
  CreatePreEvaluationFormInput,
  CreatePreEvaluationFormResult,
} from '../../../application/dto/pre-evaluation-form'
import type { PreEvaluationFormRemoteDataSource } from './pre-evaluation-form-remote-data-source'

type PublicSecurityAction = 'pre_evaluation' | 'pre_evaluation_upload'

async function getPublicSecurityToken(action: PublicSecurityAction): Promise<string> {
  const response = await $fetch<{ token: string }>('/api/public/security-token' as string, {
    query: { action },
  })

  return response.token
}

export class HttpPreEvaluationFormRemoteDataSource implements PreEvaluationFormRemoteDataSource {
  async submit(input: CreatePreEvaluationFormInput): Promise<CreatePreEvaluationFormResult> {
    const publicSecurityToken = await getPublicSecurityToken('pre_evaluation')

    return $fetch<CreatePreEvaluationFormResult>('/api/public/pre-evaluacion' as string, {
      method: 'POST',
      body: { ...input, publicSecurityToken },
    })
  }

  async uploadAttachment(file: File): Promise<{ key: string }> {
    const publicSecurityToken = await getPublicSecurityToken('pre_evaluation_upload')
    const formData = new FormData()
    formData.append('file', file)

    return $fetch<{ key: string }>('/api/public/pre-evaluacion/upload' as string, {
      method: 'POST',
      headers: {
        'x-public-security-token': publicSecurityToken,
      },
      body: formData,
    })
  }
}
