import { createInventoryDetailViewModel } from '~~/src/presentation/view-models/inventory/inventory-view-models'
import { inventoryViewModelDependencies } from './inventory-dependencies'

export const useInventoryDetailViewModel = (itemId: string) => {
  const viewModel = createInventoryDetailViewModel(inventoryViewModelDependencies, itemId)
  onMounted(() => { void viewModel.load() })
  return viewModel
}
