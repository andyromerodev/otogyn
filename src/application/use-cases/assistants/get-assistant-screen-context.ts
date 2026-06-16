import type { AssistantScreenContextDto } from '../../dto/assistant-management'
import type { AssistantManagementRepository } from '../../ports/assistant-management-repository'

export class GetAssistantScreenContextUseCase {
  constructor(private readonly assistantManagementRepository: AssistantManagementRepository) {}

  execute(): Promise<AssistantScreenContextDto> {
    return this.assistantManagementRepository.getScreenContext()
  }
}
