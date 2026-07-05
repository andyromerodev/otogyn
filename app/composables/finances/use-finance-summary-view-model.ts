import { financeServiceLocator } from '~~/src/infrastructure/finances/service-locator'
import { createFinanceSummaryViewModel } from '~~/src/presentation/view-models/finances/finance-summary-view-model'

export const useFinanceSummaryViewModel = () => {
  const viewModel = createFinanceSummaryViewModel({
    getFinanceSummaryUseCase: financeServiceLocator.getFinanceSummaryUseCase,
  })

  void viewModel.loadSummary()

  return viewModel
}
