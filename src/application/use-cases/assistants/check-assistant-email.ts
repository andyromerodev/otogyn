import type { AssistantEmailCheckResult } from '../../dto/assistant-management'
import type { AssistantManagementRepository } from '../../ports/assistant-management-repository'

export class CheckAssistantEmailUseCase {
  constructor(private readonly assistantManagementRepository: AssistantManagementRepository) {}

  execute(email: string): Promise<AssistantEmailCheckResult> {
    return this.assistantManagementRepository.checkAssistantEmail(email)
  }
}
