import type { AssistantRepository } from '../../domain/repositories/assistant-repository'

export interface DeleteAssistantInput {
  organizationId: string
  userId: string
}

export class DeleteAssistantUseCase {
  constructor(private readonly assistantRepository: AssistantRepository) {}

  execute(input: DeleteAssistantInput): Promise<void> {
    return this.assistantRepository.deleteAssistant(input.organizationId, input.userId)
  }
}
