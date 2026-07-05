import { describe, expect, it, vi } from 'vitest'
import { BusinessRuleError } from '../../../domain/errors/business-rule-error'
import type { ExpenseCategory } from '../../../domain/entities/expense-category'
import type { ExpenseCategoryRepository } from '../../../domain/repositories/expense-category-repository'
import type { ExpenseRepository } from '../../../domain/repositories/expense-repository'
import { CreateExpenseUseCase } from './create-expense'

const activeCategory: ExpenseCategory = {
  id: 'cat_1',
  organizationId: 'org_1',
  name: 'Suministros',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
}

const makeRepositories = (category: ExpenseCategory | null = activeCategory) => ({
  expenseRepo: {
    create: vi.fn().mockImplementation(async (expense) => expense),
  } as unknown as ExpenseRepository & { create: ReturnType<typeof vi.fn> },
  categoryRepo: {
    findById: vi.fn().mockResolvedValue(category),
  } as unknown as ExpenseCategoryRepository & { findById: ReturnType<typeof vi.fn> },
})

const baseInput = {
  organizationId: 'org_1',
  createdBy: 'user_1',
  categoryId: 'cat_1',
  amount: 500,
  description: 'Compra de guantes',
  expenseDate: new Date('2026-07-05T10:00:00.000Z'),
}

describe('CreateExpenseUseCase', () => {
  it('creates an expense with valid inputs', async () => {
    const { expenseRepo, categoryRepo } = makeRepositories()
    const useCase = new CreateExpenseUseCase(expenseRepo, categoryRepo)

    const expense = await useCase.execute(baseInput)

    expect(expenseRepo.create).toHaveBeenCalledTimes(1)
    expect(expense.organizationId).toBe('org_1')
    expect(expense.categoryId).toBe('cat_1')
    expect(expense.amount).toBe(500)
    expect(expense.notes).toBeNull()
    expect(expense.id).toMatch(/[0-9a-f-]{36}/)
  })

  it('trims the description before saving', async () => {
    const { expenseRepo, categoryRepo } = makeRepositories()
    const useCase = new CreateExpenseUseCase(expenseRepo, categoryRepo)

    const expense = await useCase.execute({ ...baseInput, description: '  Compra  ' })

    expect(expense.description).toBe('Compra')
  })

  it('rejects a non-positive amount', async () => {
    const { expenseRepo, categoryRepo } = makeRepositories()
    const useCase = new CreateExpenseUseCase(expenseRepo, categoryRepo)

    await expect(useCase.execute({ ...baseInput, amount: 0 })).rejects.toThrow(BusinessRuleError)
    expect(expenseRepo.create).not.toHaveBeenCalled()
  })

  it('rejects an empty description', async () => {
    const { expenseRepo, categoryRepo } = makeRepositories()
    const useCase = new CreateExpenseUseCase(expenseRepo, categoryRepo)

    await expect(useCase.execute({ ...baseInput, description: '   ' })).rejects.toThrow(
      BusinessRuleError,
    )
    expect(expenseRepo.create).not.toHaveBeenCalled()
  })

  it('rejects a category that does not exist', async () => {
    const { expenseRepo, categoryRepo } = makeRepositories(null)
    const useCase = new CreateExpenseUseCase(expenseRepo, categoryRepo)

    await expect(useCase.execute(baseInput)).rejects.toThrow(BusinessRuleError)
    expect(expenseRepo.create).not.toHaveBeenCalled()
  })

  it('rejects an inactive category', async () => {
    const { expenseRepo, categoryRepo } = makeRepositories({ ...activeCategory, isActive: false })
    const useCase = new CreateExpenseUseCase(expenseRepo, categoryRepo)

    await expect(useCase.execute(baseInput)).rejects.toThrow(BusinessRuleError)
    expect(expenseRepo.create).not.toHaveBeenCalled()
  })

  it('rejects a category from another organization', async () => {
    const { expenseRepo, categoryRepo } = makeRepositories({
      ...activeCategory,
      organizationId: 'org_2',
    })
    const useCase = new CreateExpenseUseCase(expenseRepo, categoryRepo)

    await expect(useCase.execute(baseInput)).rejects.toThrow(BusinessRuleError)
    expect(expenseRepo.create).not.toHaveBeenCalled()
  })
})
