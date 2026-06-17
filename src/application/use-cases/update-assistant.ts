import type { Assistant } from '../../domain/entities/assistant'
import type { AssistantRepository, UpdateAssistantInput } from '../../domain/repositories/assistant-repository'

export class UpdateAssistantUseCase {
  constructor(private readonly assistantRepository: AssistantRepository) {}

  execute(input: UpdateAssistantInput): Promise<Assistant> {
    return this.assistantRepository.updateAssistant(input)
  }
}
