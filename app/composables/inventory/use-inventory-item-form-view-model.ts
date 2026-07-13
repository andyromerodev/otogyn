import { createInventoryItemFormViewModel } from '~~/src/presentation/view-models/inventory/inventory-view-models'
import { inventoryViewModelDependencies } from './inventory-dependencies'

export const useInventoryItemFormViewModel = (itemId?: string) => {
  const viewModel = createInventoryItemFormViewModel(inventoryViewModelDependencies, itemId)
  onMounted(() => { void viewModel.load() })
  return viewModel
}
