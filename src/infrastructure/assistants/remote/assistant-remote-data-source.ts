import type { AssistantMutationInput, AssistantScreenContextDto } from '../../../application/dto/assistant-management'
import type { Assistant } from '../../../domain/entities/assistant'

export interface AssistantRemoteDataSource {
  listAssistants(): Promise<Assistant[]>
  createAssistant(input: AssistantMutationInput): Promise<Assistant>
  getScreenContext(): Promise<AssistantScreenContextDto>
}
