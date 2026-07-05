import { describe, expect, it, vi } from 'vitest'
import { BusinessRuleError } from '../../../domain/errors/business-rule-error'
import type { ExpenseCategory } from '../../../domain/entities/expense-category'
import type { ExpenseCategoryRepository } from '../../../domain/repositories/expense-category-repository'
import { UpdateExpenseCategoryUseCase } from './update-expense-category'

const existingCategory: ExpenseCategory = {
  id: 'cat_1',
  organizationId: 'org_1',
  name: 'Suministros',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
}

const makeRepository = (category: ExpenseCategory | null = existingCategory) => ({
  findById: vi.fn().mockResolvedValue(category),
  update: vi.fn().mockImplementation(async (input) => ({ ...existingCategory, ...input })),
}) as unknown as ExpenseCategoryRepository & {
  findById: ReturnType<typeof vi.fn>
  update: ReturnType<typeof vi.fn>
}

describe('UpdateExpenseCategoryUseCase', () => {
  it('updates name and trims whitespace', async () => {
    const repository = makeRepository()
    const useCase = new UpdateExpenseCategoryUseCase(repository)

    await useCase.execute({ id: 'cat_1', organizationId: 'org_1', name: ' Renta ' })

    expect(repository.update).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'cat_1', name: 'Renta' }),
    )
  })

  it('deactivates a category', async () => {
    const repository = makeRepository()
    const useCase = new UpdateExpenseCategoryUseCase(repository)

    await useCase.execute({ id: 'cat_1', organizationId: 'org_1', isActive: false })

    expect(repository.update).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'cat_1', isActive: false }),
    )
  })

  it('rejects when category does not exist', async () => {
    const repository = makeRepository(null)
    const useCase = new UpdateExpenseCategoryUseCase(repository)

    await expect(
      useCase.execute({ id: 'missing', organizationId: 'org_1', name: 'X' }),
    ).rejects.toThrow(BusinessRuleError)
    expect(repository.update).not.toHaveBeenCalled()
  })

  it('rejects when category belongs to another organization', async () => {
    const repository = makeRepository({ ...existingCategory, organizationId: 'org_2' })
    const useCase = new UpdateExpenseCategoryUseCase(repository)

    await expect(
      useCase.execute({ id: 'cat_1', organizationId: 'org_1', name: 'X' }),
    ).rejects.toThrow(BusinessRuleError)
    expect(repository.update).not.toHaveBeenCalled()
  })

  it('rejects an empty name', async () => {
    const repository = makeRepository()
    const useCase = new UpdateExpenseCategoryUseCase(repository)

    await expect(
      useCase.execute({ id: 'cat_1', organizationId: 'org_1', name: '   ' }),
    ).rejects.toThrow(BusinessRuleError)
    expect(repository.update).not.toHaveBeenCalled()
  })
})
