import { assistantServiceLocator } from '~~/src/infrastructure/assistants/service-locator'
import { createAssistantsScreen } from '~~/src/presentation/view-models/settings/create-assistants-screen'

export const useAssistantsScreen = async () => {
  const screen = createAssistantsScreen({
    listAssistantsUseCase: assistantServiceLocator.listAssistantsUseCase,
    createAssistantUseCase: assistantServiceLocator.createAssistantUseCase,
    getAssistantScreenContextUseCase: assistantServiceLocator.getAssistantScreenContextUseCase,
  })

  await Promise.all([screen.loadScreenContext(), screen.loadAssistants()])

  return screen
}
