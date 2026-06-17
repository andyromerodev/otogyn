import type { Assistant } from '../../domain/entities/assistant'
import type { AssistantRepository } from '../../domain/repositories/assistant-repository'

export interface CreateAssistantInput {
  userId: string
  organizationId: string
  name?: string
  phone?: string | null
  specialty?: string | null
}

export class CreateAssistantUseCase {
  constructor(private readonly assistantRepository: AssistantRepository) {}

  execute(input: CreateAssistantInput): Promise<Assistant> {
    return this.assistantRepository.saveAssistant({
      userId: input.userId,
      organizationId: input.organizationId,
      role: 'assistant',
      name: input.name,
      phone: input.phone ?? null,
      specialty: input.specialty ?? null,
    })
  }
}
