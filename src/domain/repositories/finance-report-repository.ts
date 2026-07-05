export interface FinanceMonthlySeriesQuery {
  organizationId: string
  from: Date
  to: Date
}

export interface FinanceMonthlySeriesItem {
  monthKey: string
  income: number
  expenses: number
}

export interface FinanceReportRepository {
  getMonthlySeries(query: FinanceMonthlySeriesQuery): Promise<FinanceMonthlySeriesItem[]>
}
