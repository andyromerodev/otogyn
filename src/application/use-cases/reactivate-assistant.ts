import type { Assistant } from '../../domain/entities/assistant'
import type { AssistantRepository } from '../../domain/repositories/assistant-repository'

export interface ReactivateAssistantInput {
  organizationId: string
  userId: string
}

export class ReactivateAssistantUseCase {
  constructor(private readonly assistantRepository: AssistantRepository) {}

  execute(input: ReactivateAssistantInput): Promise<Assistant> {
    return this.assistantRepository.reactivateAssistant(input.organizationId, input.userId)
  }
}
