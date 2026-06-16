import type { Assistant } from '../../domain/entities/assistant'
import type {
  AssistantListResult,
  AssistantMutationInput,
  AssistantScreenContextDto,
} from '../dto/assistant-management'

export interface AssistantManagementRepository {
  listAssistants(): Promise<AssistantListResult>
  createAssistant(input: AssistantMutationInput): Promise<Assistant>
  getScreenContext(): Promise<AssistantScreenContextDto>
}
