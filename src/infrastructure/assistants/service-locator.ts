import { CheckAssistantEmailUseCase } from '../../application/use-cases/assistants/check-assistant-email'
import { CreateAssistantManagementUseCase } from '../../application/use-cases/assistants/create-assistant'
import { DeactivateAssistantManagementUseCase } from '../../application/use-cases/assistants/deactivate-assistant'
import { DeleteAssistantManagementUseCase } from '../../application/use-cases/assistants/delete-assistant'
import { GetAssistantScreenContextUseCase } from '../../application/use-cases/assistants/get-assistant-screen-context'
import { ListAssistantsUseCase } from '../../application/use-cases/assistants/list-assistants'
import { ReactivateAssistantManagementUseCase } from '../../application/use-cases/assistants/reactivate-assistant'
import { UpdateAssistantManagementUseCase } from '../../application/use-cases/assistants/update-assistant'
import { HttpAssistantRemoteDataSource } from './remote/http-assistant-remote-data-source'
import { AssistantManagementRepositoryImpl } from './repositories/assistant-management-repository-impl'

const assistantRemoteDataSource = new HttpAssistantRemoteDataSource()
const assistantRepository = new AssistantManagementRepositoryImpl(assistantRemoteDataSource)

export const assistantServiceLocator = {
  listAssistantsUseCase: new ListAssistantsUseCase(assistantRepository),
  checkAssistantEmailUseCase: new CheckAssistantEmailUseCase(assistantRepository),
  createAssistantUseCase: new CreateAssistantManagementUseCase(assistantRepository),
  updateAssistantUseCase: new UpdateAssistantManagementUseCase(assistantRepository),
  deactivateAssistantUseCase: new DeactivateAssistantManagementUseCase(assistantRepository),
  reactivateAssistantUseCase: new ReactivateAssistantManagementUseCase(assistantRepository),
  deleteAssistantUseCase: new DeleteAssistantManagementUseCase(assistantRepository),
  getAssistantScreenContextUseCase: new GetAssistantScreenContextUseCase(assistantRepository),
}
