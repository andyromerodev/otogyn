import { describe, expect, it, vi } from 'vitest'
import type { FinanceReportRepository } from '../../../domain/repositories/finance-report-repository'
import { createAppDateTime } from '../../utils/date/local-date'
import { GetFinanceSummaryUseCase } from './get-finance-summary'

const makeRepository = (items: Array<{ monthKey: string; income: number; expenses: number }>) => ({
  getMonthlySeries: vi.fn().mockResolvedValue(items),
}) as unknown as FinanceReportRepository & {
  getMonthlySeries: ReturnType<typeof vi.fn>
}

describe('GetFinanceSummaryUseCase', () => {
  it('returns a 12-month series and current-vs-previous month deltas', async () => {
    const repository = makeRepository([
      { monthKey: '2026-06', income: 500, expenses: 200 },
      { monthKey: '2026-07', income: 800, expenses: 300 },
    ])
    const useCase = new GetFinanceSummaryUseCase(repository)
    const referenceDate = createAppDateTime(2026, 7, 15, 10)

    const summary = await useCase.execute({
      organizationId: 'org_1',
      referenceDate,
    })

    expect(repository.getMonthlySeries).toHaveBeenCalledWith({
      organizationId: 'org_1',
      from: createAppDateTime(2025, 8, 1),
      to: createAppDateTime(2026, 8, 1),
    })
    expect(summary.series).toHaveLength(12)
    expect(summary.series[0]?.monthKey).toBe('2025-08')
    expect(summary.series[11]?.monthKey).toBe('2026-07')
    expect(summary.income).toBe(800)
    expect(summary.expenses).toBe(300)
    expect(summary.balance).toBe(500)
    expect(summary.previousIncome).toBe(500)
    expect(summary.previousExpenses).toBe(200)
    expect(summary.previousBalance).toBe(300)
    expect(summary.incomeDelta).toBe(300)
    expect(summary.expensesDelta).toBe(100)
    expect(summary.balanceDelta).toBe(200)
    expect(summary.incomeDeltaPercentage).toBe(60)
    expect(summary.expensesDeltaPercentage).toBe(50)
    expect(summary.balanceDeltaPercentage).toBe(66.7)
  })

  it('returns null percentage delta when the previous month was zero and current is not', async () => {
    const repository = makeRepository([{ monthKey: '2026-07', income: 1200, expenses: 400 }])
    const useCase = new GetFinanceSummaryUseCase(repository)

    const summary = await useCase.execute({
      organizationId: 'org_1',
      referenceDate: createAppDateTime(2026, 7, 5, 8),
    })

    expect(summary.previousIncome).toBe(0)
    expect(summary.incomeDelta).toBe(1200)
    expect(summary.incomeDeltaPercentage).toBeNull()
    expect(summary.expensesDeltaPercentage).toBeNull()
  })

  it('uses zero percentage delta when both months are zero', async () => {
    const repository = makeRepository([])
    const useCase = new GetFinanceSummaryUseCase(repository)

    const summary = await useCase.execute({
      organizationId: 'org_1',
      referenceDate: createAppDateTime(2026, 7, 5, 8),
    })

    expect(summary.incomeDeltaPercentage).toBe(0)
    expect(summary.expensesDeltaPercentage).toBe(0)
    expect(summary.balanceDeltaPercentage).toBe(0)
  })
})
