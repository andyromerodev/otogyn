import type { Assistant } from '../../domain/entities/assistant'
import type {
  AssistantActivationInput,
  AssistantEmailCheckResult,
  AssistantListResult,
  AssistantMutationInput,
  AssistantScreenContextDto,
  AssistantUpdateInput,
} from '../dto/assistant-management'

export interface AssistantManagementRepository {
  listAssistants(): Promise<AssistantListResult>
  checkAssistantEmail(email: string): Promise<AssistantEmailCheckResult>
  createAssistant(input: AssistantMutationInput): Promise<Assistant>
  updateAssistant(input: AssistantUpdateInput): Promise<Assistant>
  deactivateAssistant(input: AssistantActivationInput): Promise<Assistant>
  reactivateAssistant(input: AssistantActivationInput): Promise<Assistant>
  deleteAssistant(input: AssistantActivationInput): Promise<void>
  getScreenContext(): Promise<AssistantScreenContextDto>
}
