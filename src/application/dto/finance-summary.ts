export interface FinanceSummaryMonthDto {
  monthKey: string
  monthLabel: string
  monthShortLabel: string
  income: number
  expenses: number
  balance: number
}

export interface FinanceSummaryDto {
  monthKey: string
  monthLabel: string
  previousMonthKey: string
  previousMonthLabel: string
  income: number
  expenses: number
  balance: number
  previousIncome: number
  previousExpenses: number
  previousBalance: number
  incomeDelta: number
  expensesDelta: number
  balanceDelta: number
  incomeDeltaPercentage: number | null
  expensesDeltaPercentage: number | null
  balanceDeltaPercentage: number | null
  series: FinanceSummaryMonthDto[]
}
