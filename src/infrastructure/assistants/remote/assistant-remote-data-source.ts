import type {
  AssistantActivationInput,
  AssistantEmailCheckResult,
  AssistantMutationInput,
  AssistantScreenContextDto,
  AssistantUpdateInput,
} from '../../../application/dto/assistant-management'
import type { Assistant } from '../../../domain/entities/assistant'

export interface AssistantRemoteDataSource {
  listAssistants(): Promise<Assistant[]>
  checkAssistantEmail(email: string): Promise<AssistantEmailCheckResult>
  createAssistant(input: AssistantMutationInput): Promise<Assistant>
  updateAssistant(input: AssistantUpdateInput): Promise<Assistant>
  deactivateAssistant(input: AssistantActivationInput): Promise<Assistant>
  reactivateAssistant(input: AssistantActivationInput): Promise<Assistant>
  deleteAssistant(input: AssistantActivationInput): Promise<void>
  getScreenContext(): Promise<AssistantScreenContextDto>
}
