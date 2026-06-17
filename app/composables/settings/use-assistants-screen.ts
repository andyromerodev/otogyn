import { assistantServiceLocator } from '~~/src/infrastructure/assistants/service-locator'
import { createAssistantsScreen } from '~~/src/presentation/view-models/settings/create-assistants-screen'

export const useAssistantsScreen = async () => {
  const screen = createAssistantsScreen({
    listAssistantsUseCase: assistantServiceLocator.listAssistantsUseCase,
    checkAssistantEmailUseCase: assistantServiceLocator.checkAssistantEmailUseCase,
    createAssistantUseCase: assistantServiceLocator.createAssistantUseCase,
    updateAssistantUseCase: assistantServiceLocator.updateAssistantUseCase,
    deactivateAssistantUseCase: assistantServiceLocator.deactivateAssistantUseCase,
    reactivateAssistantUseCase: assistantServiceLocator.reactivateAssistantUseCase,
    deleteAssistantUseCase: assistantServiceLocator.deleteAssistantUseCase,
    getAssistantScreenContextUseCase: assistantServiceLocator.getAssistantScreenContextUseCase,
  })

  await Promise.all([screen.loadScreenContext(), screen.loadAssistants()])

  return screen
}
