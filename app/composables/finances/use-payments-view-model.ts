import { onMounted } from 'vue'
import { financeServiceLocator } from '~~/src/infrastructure/finances/service-locator'
import { createPaymentsListViewModel } from '~~/src/presentation/view-models/finances/payments-list-view-model'

export const usePaymentsViewModel = () => {
  const viewModel = createPaymentsListViewModel({
    listPaymentsUseCase: financeServiceLocator.listPaymentsUseCase,
  })

  onMounted(() => {
    void viewModel.loadPayments()
  })

  return viewModel
}
