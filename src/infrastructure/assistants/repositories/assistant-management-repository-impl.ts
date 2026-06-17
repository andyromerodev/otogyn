import type { Assistant } from '../../../domain/entities/assistant'
import type {
  AssistantActivationInput,
  AssistantEmailCheckResult,
  AssistantListResult,
  AssistantMutationInput,
  AssistantScreenContextDto,
  AssistantUpdateInput,
} from '../../../application/dto/assistant-management'
import type { AssistantManagementRepository } from '../../../application/ports/assistant-management-repository'
import type { AssistantRemoteDataSource } from '../remote/assistant-remote-data-source'

export class AssistantManagementRepositoryImpl implements AssistantManagementRepository {
  constructor(private readonly remoteDataSource: AssistantRemoteDataSource) {}

  listAssistants(): Promise<AssistantListResult> {
    return this.remoteDataSource.listAssistants()
  }

  checkAssistantEmail(email: string): Promise<AssistantEmailCheckResult> {
    return this.remoteDataSource.checkAssistantEmail(email)
  }

  createAssistant(input: AssistantMutationInput): Promise<Assistant> {
    return this.remoteDataSource.createAssistant(input)
  }

  updateAssistant(input: AssistantUpdateInput): Promise<Assistant> {
    return this.remoteDataSource.updateAssistant(input)
  }

  deactivateAssistant(input: AssistantActivationInput): Promise<Assistant> {
    return this.remoteDataSource.deactivateAssistant(input)
  }

  reactivateAssistant(input: AssistantActivationInput): Promise<Assistant> {
    return this.remoteDataSource.reactivateAssistant(input)
  }

  deleteAssistant(input: AssistantActivationInput): Promise<void> {
    return this.remoteDataSource.deleteAssistant(input)
  }

  getScreenContext(): Promise<AssistantScreenContextDto> {
    return this.remoteDataSource.getScreenContext()
  }
}
