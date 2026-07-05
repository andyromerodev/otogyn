import { describe, expect, it, vi } from 'vitest'
import { BusinessRuleError } from '../../../domain/errors/business-rule-error'
import type { Expense } from '../../../domain/entities/expense'
import type { ExpenseCategory } from '../../../domain/entities/expense-category'
import type { ExpenseCategoryRepository } from '../../../domain/repositories/expense-category-repository'
import type { ExpenseRepository } from '../../../domain/repositories/expense-repository'
import { UpdateExpenseUseCase } from './update-expense'

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

const activeCategory: ExpenseCategory = {
  id: 'cat_2',
  organizationId: 'org_1',
  name: 'Renta',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
}

const makeRepositories = (
  expense: Expense | null = existingExpense,
  category: ExpenseCategory | null = activeCategory,
) => ({
  expenseRepo: {
    findById: vi.fn().mockResolvedValue(expense),
    update: vi.fn().mockImplementation(async (input) => ({ ...existingExpense, ...input })),
  } as unknown as ExpenseRepository & {
    findById: ReturnType<typeof vi.fn>
    update: ReturnType<typeof vi.fn>
  },
  categoryRepo: {
    findById: vi.fn().mockResolvedValue(category),
  } as unknown as ExpenseCategoryRepository & { findById: ReturnType<typeof vi.fn> },
})

describe('UpdateExpenseUseCase', () => {
  it('updates an existing expense', async () => {
    const { expenseRepo, categoryRepo } = makeRepositories()
    const useCase = new UpdateExpenseUseCase(expenseRepo, categoryRepo)

    await useCase.execute({
      id: 'expense_1',
      organizationId: 'org_1',
      amount: 750,
      description: ' Compra de insumos ',
    })

    expect(expenseRepo.update).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'expense_1', amount: 750, description: 'Compra de insumos' }),
    )
  })

  it('rejects when the expense does not exist', async () => {
    const { expenseRepo, categoryRepo } = makeRepositories(null)
    const useCase = new UpdateExpenseUseCase(expenseRepo, categoryRepo)

    await expect(
      useCase.execute({ id: 'missing', organizationId: 'org_1', amount: 100 }),
    ).rejects.toThrow(BusinessRuleError)
    expect(expenseRepo.update).not.toHaveBeenCalled()
  })

  it('rejects when the expense belongs to another organization', async () => {
    const { expenseRepo, categoryRepo } = makeRepositories({
      ...existingExpense,
      organizationId: 'org_2',
    })
    const useCase = new UpdateExpenseUseCase(expenseRepo, categoryRepo)

    await expect(
      useCase.execute({ id: 'expense_1', organizationId: 'org_1', amount: 100 }),
    ).rejects.toThrow(BusinessRuleError)
    expect(expenseRepo.update).not.toHaveBeenCalled()
  })

  it('rejects a non-positive amount', async () => {
    const { expenseRepo, categoryRepo } = makeRepositories()
    const useCase = new UpdateExpenseUseCase(expenseRepo, categoryRepo)

    await expect(
      useCase.execute({ id: 'expense_1', organizationId: 'org_1', amount: -5 }),
    ).rejects.toThrow(BusinessRuleError)
    expect(expenseRepo.update).not.toHaveBeenCalled()
  })

  it('rejects an empty description', async () => {
    const { expenseRepo, categoryRepo } = makeRepositories()
    const useCase = new UpdateExpenseUseCase(expenseRepo, categoryRepo)

    await expect(
      useCase.execute({ id: 'expense_1', organizationId: 'org_1', description: '   ' }),
    ).rejects.toThrow(BusinessRuleError)
    expect(expenseRepo.update).not.toHaveBeenCalled()
  })

  it('rejects an inactive category when changing categoryId', async () => {
    const { expenseRepo, categoryRepo } = makeRepositories(existingExpense, {
      ...activeCategory,
      isActive: false,
    })
    const useCase = new UpdateExpenseUseCase(expenseRepo, categoryRepo)

    await expect(
      useCase.execute({ id: 'expense_1', organizationId: 'org_1', categoryId: 'cat_2' }),
    ).rejects.toThrow(BusinessRuleError)
    expect(expenseRepo.update).not.toHaveBeenCalled()
  })
})
