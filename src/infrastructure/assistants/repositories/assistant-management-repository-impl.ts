import type { Assistant } from '../../../domain/entities/assistant'
import type {
  AssistantListResult,
  AssistantMutationInput,
  AssistantScreenContextDto,
} from '../../../application/dto/assistant-management'
import type { AssistantManagementRepository } from '../../../application/ports/assistant-management-repository'
import type { AssistantRemoteDataSource } from '../remote/assistant-remote-data-source'

export class AssistantManagementRepositoryImpl implements AssistantManagementRepository {
  constructor(private readonly remoteDataSource: AssistantRemoteDataSource) {}

  listAssistants(): Promise<AssistantListResult> {
    return this.remoteDataSource.listAssistants()
  }

  createAssistant(input: AssistantMutationInput): Promise<Assistant> {
    return this.remoteDataSource.createAssistant(input)
  }

  getScreenContext(): Promise<AssistantScreenContextDto> {
    return this.remoteDataSource.getScreenContext()
  }
}
