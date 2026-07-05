import type { FinanceSummaryDto } from '~~/src/application/dto/finance-summary'

export interface FinanceSummaryViewModelDependencies {
  getFinanceSummaryUseCase: { execute(): Promise<FinanceSummaryDto> }
}
