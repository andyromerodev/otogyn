import type { Assistant } from '../../domain/entities/assistant'
import type { AssistantRepository } from '../../domain/repositories/assistant-repository'

export interface DeactivateAssistantInput {
  organizationId: string
  userId: string
}

export class DeactivateAssistantUseCase {
  constructor(private readonly assistantRepository: AssistantRepository) {}

  execute(input: DeactivateAssistantInput): Promise<Assistant> {
    return this.assistantRepository.deactivateAssistant(input.organizationId, input.userId)
  }
}
