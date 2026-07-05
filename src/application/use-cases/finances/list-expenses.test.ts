import { describe, expect, it, vi } from 'vitest'
import type { ExpenseRepository } from '../../../domain/repositories/expense-repository'
import { ListExpensesUseCase } from './list-expenses'

const makeRepository = () => ({
  listPage: vi.fn().mockResolvedValue({
    items: [],
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 1,
  }),
}) as unknown as ExpenseRepository & { listPage: ReturnType<typeof vi.fn> }

describe('ListExpensesUseCase', () => {
  it('lists expenses with default pagination', async () => {
    const repository = makeRepository()
    const useCase = new ListExpensesUseCase(repository)

    await useCase.execute({ organizationId: 'org_1' })

    expect(repository.listPage).toHaveBeenCalledWith({
      organizationId: 'org_1',
      page: 1,
      pageSize: 10,
      categoryId: undefined,
      expenseDateFrom: undefined,
      expenseDateTo: undefined,
    })
  })

  it('passes filters through to the repository', async () => {
    const repository = makeRepository()
    const useCase = new ListExpensesUseCase(repository)
    const from = new Date('2026-07-01T05:00:00.000Z')
    const to = new Date('2026-08-01T05:00:00.000Z')

    await useCase.execute({
      organizationId: 'org_1',
      categoryId: 'cat_1',
      expenseDateFrom: from,
      expenseDateTo: to,
      page: 2,
      pageSize: 20,
    })

    expect(repository.listPage).toHaveBeenCalledWith({
      organizationId: 'org_1',
      page: 2,
      pageSize: 20,
      categoryId: 'cat_1',
      expenseDateFrom: from,
      expenseDateTo: to,
    })
  })
})
