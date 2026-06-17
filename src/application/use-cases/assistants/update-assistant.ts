import type { Assistant } from '../../../domain/entities/assistant'
import type { AssistantUpdateInput } from '../../dto/assistant-management'
import type { AssistantManagementRepository } from '../../ports/assistant-management-repository'

export class UpdateAssistantManagementUseCase {
  constructor(private readonly assistantManagementRepository: AssistantManagementRepository) {}

  execute(input: AssistantUpdateInput): Promise<Assistant> {
    return this.assistantManagementRepository.updateAssistant(input)
  }
}
