import type { FinanceSummaryDto } from '../dto/finance-summary'

export interface FinanceSummaryManagementRepository {
  getSummary(): Promise<FinanceSummaryDto>
}
