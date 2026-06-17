import type { AssistantRepository } from '../../domain/repositories/assistant-repository'

export interface RemoveAssistantInput {
  organizationId: string
  userId: string
}

export class RemoveAssistantUseCase {
  constructor(private readonly assistantRepository: AssistantRepository) {}

  execute(input: RemoveAssistantInput): Promise<void> {
    return this.assistantRepository.removeAssistant(input.organizationId, input.userId)
  }
}
