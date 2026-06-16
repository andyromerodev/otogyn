import type { Assistant } from '../../domain/entities/assistant'
import type { AssistantRepository } from '../../domain/repositories/assistant-repository'

export interface ListAssistantsInput {
  organizationId: string
}

export class ListAssistantsUseCase {
  constructor(private readonly assistantRepository: AssistantRepository) {}

  execute(input: ListAssistantsInput): Promise<Assistant[]> {
    return this.assistantRepository.listByOrganization(input.organizationId)
  }
}
