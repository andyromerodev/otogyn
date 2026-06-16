import { CreateAssistantManagementUseCase } from '../../application/use-cases/assistants/create-assistant'
import { GetAssistantScreenContextUseCase } from '../../application/use-cases/assistants/get-assistant-screen-context'
import { ListAssistantsUseCase } from '../../application/use-cases/assistants/list-assistants'
import { HttpAssistantRemoteDataSource } from './remote/http-assistant-remote-data-source'
import { AssistantManagementRepositoryImpl } from './repositories/assistant-management-repository-impl'

const assistantRemoteDataSource = new HttpAssistantRemoteDataSource()
const assistantRepository = new AssistantManagementRepositoryImpl(assistantRemoteDataSource)

export const assistantServiceLocator = {
  listAssistantsUseCase: new ListAssistantsUseCase(assistantRepository),
  createAssistantUseCase: new CreateAssistantManagementUseCase(assistantRepository),
  getAssistantScreenContextUseCase: new GetAssistantScreenContextUseCase(assistantRepository),
}
