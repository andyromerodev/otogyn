import { assistantServiceLocator } from '~~/src/infrastructure/assistants/service-locator'
import { createAssistantsScreen } from '~~/src/presentation/view-models/settings/create-assistants-screen'

export const useAssistantsScreen = async () => {
  const route = useRoute()
  const page = typeof route.query.assistantsPage === 'string' ? Number.parseInt(route.query.assistantsPage, 10) : 1
  const pageSize = typeof route.query.assistantsPageSize === 'string' ? Number.parseInt(route.query.assistantsPageSize, 10) : 10

  const screen = createAssistantsScreen({
    listAssistantsUseCase: assistantServiceLocator.listAssistantsUseCase,
    checkAssistantEmailUseCase: assistantServiceLocator.checkAssistantEmailUseCase,
    createAssistantUseCase: assistantServiceLocator.createAssistantUseCase,
    updateAssistantUseCase: assistantServiceLocator.updateAssistantUseCase,
    deactivateAssistantUseCase: assistantServiceLocator.deactivateAssistantUseCase,
    reactivateAssistantUseCase: assistantServiceLocator.reactivateAssistantUseCase,
    deleteAssistantUseCase: assistantServiceLocator.deleteAssistantUseCase,
    getAssistantScreenContextUseCase: assistantServiceLocator.getAssistantScreenContextUseCase,
    initialPage: Number.isNaN(page) ? 1 : page,
    initialPageSize: Number.isNaN(pageSize) ? 10 : pageSize,
  })

  await Promise.all([screen.loadScreenContext(), screen.loadAssistants()])

  return screen
}
