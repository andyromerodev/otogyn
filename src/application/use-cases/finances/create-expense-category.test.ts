import { describe, expect, it, vi } from 'vitest'
import { BusinessRuleError } from '../../../domain/errors/business-rule-error'
import type { ExpenseCategoryRepository } from '../../../domain/repositories/expense-category-repository'
import { CreateExpenseCategoryUseCase } from './create-expense-category'

const makeRepository = () => ({
  create: vi.fn().mockImplementation(async (cat) => cat),
}) as unknown as ExpenseCategoryRepository & { create: ReturnType<typeof vi.fn> }

describe('CreateExpenseCategoryUseCase', () => {
  it('creates a category with trimmed name', async () => {
    const repository = makeRepository()
    const useCase = new CreateExpenseCategoryUseCase(repository)

    const cat = await useCase.execute({ organizationId: 'org_1', name: '  Suministros  ' })

    expect(cat.name).toBe('Suministros')
    expect(cat.isActive).toBe(true)
    expect(cat.organizationId).toBe('org_1')
    expect(cat.id).toMatch(/[0-9a-f-]{36}/)
  })

  it('rejects an empty name', async () => {
    const repository = makeRepository()
    const useCase = new CreateExpenseCategoryUseCase(repository)

    await expect(useCase.execute({ organizationId: 'org_1', name: '   ' })).rejects.toThrow(
      BusinessRuleError,
    )
    expect(repository.create).not.toHaveBeenCalled()
  })
})
