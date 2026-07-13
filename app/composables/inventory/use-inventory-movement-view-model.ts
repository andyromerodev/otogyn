import { useSessionContext } from '../auth/use-session-context'
import { createInventoryMovementViewModel } from '~~/src/presentation/view-models/inventory/inventory-view-models'
import { inventoryViewModelDependencies } from './inventory-dependencies'

export const useInventoryMovementViewModel = (itemId?: string) => {
  const { sessionContext } = useSessionContext()
  const viewModel = createInventoryMovementViewModel(inventoryViewModelDependencies, sessionContext.value?.role === 'admin_doctor', itemId)
  onMounted(() => { void viewModel.load() })
  return viewModel
}
