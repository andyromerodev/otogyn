import type { AssistantListResult } from '../../dto/assistant-management'
import type { AssistantManagementRepository } from '../../ports/assistant-management-repository'

export class ListAssistantsUseCase {
  constructor(private readonly assistantManagementRepository: AssistantManagementRepository) {}

  execute(): Promise<AssistantListResult> {
    return this.assistantManagementRepository.listAssistants()
  }
}
