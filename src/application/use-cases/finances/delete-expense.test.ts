import { describe, expect, it, vi } from 'vitest'
import { BusinessRuleError } from '../../../domain/errors/business-rule-error'
import type { Expense } from '../../../domain/entities/expense'
import type { ExpenseRepository } from '../../../domain/repositories/expense-repository'
import { DeleteExpenseUseCase } from './delete-expense'

const existingExpense: Expense = {
  id: 'expense_1',
  organizationId: 'org_1',
  categoryId: 'cat_1',
  amount: 500,
  description: 'Compra de guantes',
  expenseDate: new Date('2026-07-05T10:00:00.000Z'),
  notes: null,
  createdBy: 'user_1',
  createdAt: new Date(),
  updatedAt: new Date(),
}

const makeRepository = (expense: Expense | null = existingExpense) => ({
  findById: vi.fn().mockResolvedValue(expense),
  delete: vi.fn().mockResolvedValue(undefined),
}) as unknown as ExpenseRepository & {
  findById: ReturnType<typeof vi.fn>
  delete: ReturnType<typeof vi.fn>
}

describe('DeleteExpenseUseCase', () => {
  it('deletes an existing expense of the same organization', async () => {
    const repository = makeRepository()
    const useCase = new DeleteExpenseUseCase(repository)

    await useCase.execute({ expenseId: 'expense_1', organizationId: 'org_1' })

    expect(repository.delete).toHaveBeenCalledWith('expense_1')
  })

  it('rejects when the expense does not exist', async () => {
    const repository = makeRepository(null)
    const useCase = new DeleteExpenseUseCase(repository)

    await expect(
      useCase.execute({ expenseId: 'missing', organizationId: 'org_1' }),
    ).rejects.toThrow(BusinessRuleError)
    expect(repository.delete).not.toHaveBeenCalled()
  })

  it('rejects when the expense belongs to another organization', async () => {
    const repository = makeRepository({ ...existingExpense, organizationId: 'org_2' })
    const useCase = new DeleteExpenseUseCase(repository)

    await expect(
      useCase.execute({ expenseId: 'expense_1', organizationId: 'org_1' }),
    ).rejects.toThrow(BusinessRuleError)
    expect(repository.delete).not.toHaveBeenCalled()
  })
})
