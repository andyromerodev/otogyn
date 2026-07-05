import { onMounted } from 'vue'
import { financeServiceLocator } from '~~/src/infrastructure/finances/service-locator'
import { createExpensesListViewModel } from '~~/src/presentation/view-models/finances/expenses-list-view-model'

export const useExpensesViewModel = () => {
  const viewModel = createExpensesListViewModel({
    listExpensesUseCase: financeServiceLocator.listExpensesUseCase,
    listCategoriesUseCase: financeServiceLocator.listCategoriesUseCase,
  })

  onMounted(() => {
    void viewModel.loadAll()
  })

  return viewModel
}
