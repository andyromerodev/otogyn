import type { AssistantMutationInput } from '../../dto/assistant-management'
import type { AssistantManagementRepository } from '../../ports/assistant-management-repository'
import type { Assistant } from '../../../domain/entities/assistant'

export class CreateAssistantManagementUseCase {
  constructor(private readonly assistantManagementRepository: AssistantManagementRepository) {}

  execute(input: AssistantMutationInput): Promise<Assistant> {
    return this.assistantManagementRepository.createAssistant(input)
  }
}
