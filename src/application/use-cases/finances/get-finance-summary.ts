import type { FinanceSummaryDto, FinanceSummaryMonthDto } from '../../dto/finance-summary'
import type { FinanceReportRepository } from '../../../domain/repositories/finance-report-repository'
import { APP_TIME_ZONE, createAppDateTime, getAppDateParts } from '../../utils/date/local-date'

export interface GetFinanceSummaryInput {
  organizationId: string
  referenceDate?: Date
}

const monthFormatter = new Intl.DateTimeFormat('es-PE', {
  timeZone: APP_TIME_ZONE,
  month: 'long',
  year: 'numeric',
})

const shortMonthFormatter = new Intl.DateTimeFormat('es-PE', {
  timeZone: APP_TIME_ZONE,
  month: 'short',
})

const capitalize = (value: string) =>
  value.length ? value.charAt(0).toUpperCase() + value.slice(1) : value

const getMonthStart = (date: Date) => {
  const { year, month } = getAppDateParts(date)
  return createAppDateTime(year, month, 1)
}

const addMonths = (date: Date, months: number) => {
  const { year, month } = getAppDateParts(date)
  return createAppDateTime(year, month + months, 1)
}

const toMonthKey = (date: Date) => {
  const { year, month } = getAppDateParts(date)
  return `${year}-${String(month).padStart(2, '0')}`
}

const toPercentageDelta = (current: number, previous: number) => {
  if (previous === 0) {
    return current === 0 ? 0 : null
  }

  return Number((((current - previous) / previous) * 100).toFixed(1))
}

export class GetFinanceSummaryUseCase {
  constructor(private readonly financeReportRepository: FinanceReportRepository) {}

  async execute(input: GetFinanceSummaryInput): Promise<FinanceSummaryDto> {
    const referenceDate = input.referenceDate ?? new Date()
    const currentMonthStart = getMonthStart(referenceDate)
    const previousMonthStart = addMonths(currentMonthStart, -1)
    const seriesStart = addMonths(currentMonthStart, -11)
    const seriesEnd = addMonths(currentMonthStart, 1)

    const rawSeries = await this.financeReportRepository.getMonthlySeries({
      organizationId: input.organizationId,
      from: seriesStart,
      to: seriesEnd,
    })

    const rawSeriesMap = new Map(rawSeries.map((item) => [item.monthKey, item]))
    const series: FinanceSummaryMonthDto[] = []

    for (let offset = 0; offset < 12; offset += 1) {
      const monthStart = addMonths(seriesStart, offset)
      const monthKey = toMonthKey(monthStart)
      const source = rawSeriesMap.get(monthKey)
      const income = source?.income ?? 0
      const expenses = source?.expenses ?? 0

      series.push({
        monthKey,
        monthLabel: capitalize(monthFormatter.format(monthStart)),
        monthShortLabel: capitalize(shortMonthFormatter.format(monthStart).replace('.', '')),
        income,
        expenses,
        balance: income - expenses,
      })
    }

    const currentMonthKey = toMonthKey(currentMonthStart)
    const previousMonthKey = toMonthKey(previousMonthStart)
    const current = series.find((item) => item.monthKey === currentMonthKey)!
    const previous = series.find((item) => item.monthKey === previousMonthKey)!

    return {
      monthKey: current.monthKey,
      monthLabel: current.monthLabel,
      previousMonthKey: previous.monthKey,
      previousMonthLabel: previous.monthLabel,
      income: current.income,
      expenses: current.expenses,
      balance: current.balance,
      previousIncome: previous.income,
      previousExpenses: previous.expenses,
      previousBalance: previous.balance,
      incomeDelta: current.income - previous.income,
      expensesDelta: current.expenses - previous.expenses,
      balanceDelta: current.balance - previous.balance,
      incomeDeltaPercentage: toPercentageDelta(current.income, previous.income),
      expensesDeltaPercentage: toPercentageDelta(current.expenses, previous.expenses),
      balanceDeltaPercentage: toPercentageDelta(current.balance, previous.balance),
      series,
    }
  }
}
