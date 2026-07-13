import { createInventorySuppliersViewModel } from '~~/src/presentation/view-models/inventory/inventory-view-models'
import { inventoryViewModelDependencies } from './inventory-dependencies'

export const useInventorySuppliersViewModel = () => {
  const viewModel = createInventorySuppliersViewModel(inventoryViewModelDependencies)
  onMounted(() => { void viewModel.load() })
  return viewModel
}
