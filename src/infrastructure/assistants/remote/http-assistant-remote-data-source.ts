import type {
  AssistantActivationInput,
  AssistantEmailCheckResult,
  AssistantMutationInput,
  AssistantScreenContextDto,
  AssistantUpdateInput,
} from '../../../application/dto/assistant-management'
import type { Assistant } from '../../../domain/entities/assistant'
import type { AssistantRemoteDataSource } from './assistant-remote-data-source'

export class HttpAssistantRemoteDataSource implements AssistantRemoteDataSource {
  async listAssistants(): Promise<Assistant[]> {
    return $fetch<Assistant[]>('/api/assistants')
  }

  async checkAssistantEmail(email: string): Promise<AssistantEmailCheckResult> {
    return $fetch<AssistantEmailCheckResult>('/api/assistants/email-status', {
      query: {
        email,
      },
    })
  }

  async createAssistant(input: AssistantMutationInput): Promise<Assistant> {
    return $fetch<Assistant>('/api/assistants', {
      method: 'POST',
      body: input,
    })
  }

  async updateAssistant(input: AssistantUpdateInput): Promise<Assistant> {
    return $fetch<Assistant>(`/api/assistants/${input.userId}`, {
      method: 'PATCH',
      body: {
        name: input.name,
        phone: input.phone,
        specialty: input.specialty,
      },
    })
  }

  async deactivateAssistant(input: AssistantActivationInput): Promise<Assistant> {
    return $fetch<Assistant>(`/api/assistants/${input.userId}/deactivate`, {
      method: 'POST',
    })
  }

  async reactivateAssistant(input: AssistantActivationInput): Promise<Assistant> {
    return $fetch<Assistant>(`/api/assistants/${input.userId}/reactivate`, {
      method: 'POST',
    })
  }

  async deleteAssistant(input: AssistantActivationInput): Promise<void> {
    await $fetch(`/api/assistants/${input.userId}`, {
      method: 'DELETE',
    })
  }

  async getScreenContext(): Promise<AssistantScreenContextDto> {
    return $fetch<AssistantScreenContextDto>('/api/auth/session-context')
  }
}
