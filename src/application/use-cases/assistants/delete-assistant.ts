import type { AssistantActivationInput } from '../../dto/assistant-management'
import type { AssistantManagementRepository } from '../../ports/assistant-management-repository'

export class DeleteAssistantManagementUseCase {
  constructor(private readonly assistantManagementRepository: AssistantManagementRepository) {}

  execute(input: AssistantActivationInput): Promise<void> {
    return this.assistantManagementRepository.deleteAssistant(input)
  }
}
