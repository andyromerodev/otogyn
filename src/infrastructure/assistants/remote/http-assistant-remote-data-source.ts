import type { AssistantMutationInput, AssistantScreenContextDto } from '../../../application/dto/assistant-management'
import type { Assistant } from '../../../domain/entities/assistant'
import type { AssistantRemoteDataSource } from './assistant-remote-data-source'

export class HttpAssistantRemoteDataSource implements AssistantRemoteDataSource {
  async listAssistants(): Promise<Assistant[]> {
    return $fetch<Assistant[]>('/api/assistants')
  }

  async createAssistant(input: AssistantMutationInput): Promise<Assistant> {
    return $fetch<Assistant>('/api/assistants', {
      method: 'POST',
      body: input,
    })
  }

  async getScreenContext(): Promise<AssistantScreenContextDto> {
    return $fetch<AssistantScreenContextDto>('/api/auth/session-context')
  }
}
