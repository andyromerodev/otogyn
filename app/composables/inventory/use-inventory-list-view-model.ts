import { useSessionContext } from '../auth/use-session-context'
import { createInventoryListViewModel } from '~~/src/presentation/view-models/inventory/inventory-view-models'
import { inventoryViewModelDependencies } from './inventory-dependencies'

export const useInventoryListViewModel = () => {
  const { sessionContext } = useSessionContext()
  const viewModel = createInventoryListViewModel(inventoryViewModelDependencies, sessionContext.value?.role === 'admin_doctor')
  onMounted(() => { void viewModel.load() })
  return viewModel
}
