import { onMounted } from 'vue'
import { financeServiceLocator } from '~~/src/infrastructure/finances/service-locator'
import { createExpenseCategoriesViewModel } from '~~/src/presentation/view-models/finances/expense-categories-view-model'

export const useExpenseCategoriesViewModel = () => {
  const viewModel = createExpenseCategoriesViewModel({
    listCategoriesUseCase: financeServiceLocator.listCategoriesUseCase,
    createCategoryUseCase: financeServiceLocator.createCategoryUseCase,
    updateCategoryUseCase: {
      execute: (id, input) => financeServiceLocator.updateCategoryUseCase.execute(id, input),
    },
  })

  onMounted(() => {
    void viewModel.loadCategories(true)
  })

  return viewModel
}
