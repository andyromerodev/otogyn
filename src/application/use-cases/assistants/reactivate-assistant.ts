import type { Assistant } from '../../../domain/entities/assistant'
import type { AssistantActivationInput } from '../../dto/assistant-management'
import type { AssistantManagementRepository } from '../../ports/assistant-management-repository'

export class ReactivateAssistantManagementUseCase {
  constructor(private readonly assistantManagementRepository: AssistantManagementRepository) {}

  execute(input: AssistantActivationInput): Promise<Assistant> {
    return this.assistantManagementRepository.reactivateAssistant(input)
  }
}
