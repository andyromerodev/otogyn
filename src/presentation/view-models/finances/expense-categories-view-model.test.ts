import { describe, expect, it, vi } from 'vitest'
import { createExpenseCategoriesViewModel } from './expense-categories-view-model'
import type { ExpenseCategory } from '~~/src/domain/entities/expense-category'

const makeCategory = (overrides: Partial<ExpenseCategory> = {}): ExpenseCategory => ({
  id: 'cat_1',
  organizationId: 'org_1',
  name: 'Suministros',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

const makeDeps = (categories: ExpenseCategory[] = [makeCategory()]) => ({
  listCategoriesUseCase: { execute: vi.fn().mockResolvedValue(categories) },
  createCategoryUseCase: {
    execute: vi.fn().mockImplementation(async ({ name }) => makeCategory({ id: 'cat_new', name })),
  },
  updateCategoryUseCase: {
    execute: vi.fn().mockImplementation(async (id: string, input: Partial<ExpenseCategory>) =>
      makeCategory({ id, ...input }),
    ),
  },
})

describe('createExpenseCategoriesViewModel', () => {
  it('loads categories', async () => {
    const deps = makeDeps()
    const vm = createExpenseCategoriesViewModel(deps)

    await vm.loadCategories()

    expect(deps.listCategoriesUseCase.execute).toHaveBeenCalledWith({ includeInactive: false })
    expect(vm.categories.value).toHaveLength(1)
  })

  it('creates a category and appends it to the list', async () => {
    const deps = makeDeps([])
    const vm = createExpenseCategoriesViewModel(deps)

    vm.openCreateForm()
    vm.createForm.name = 'Renta'
    await vm.submitCreate()

    expect(vm.categories.value).toHaveLength(1)
    expect(vm.categories.value[0]?.name).toBe('Renta')
    expect(vm.showCreateForm.value).toBe(false)
  })

  it('rejects empty name on create', async () => {
    const deps = makeDeps([])
    const vm = createExpenseCategoriesViewModel(deps)

    vm.openCreateForm()
    vm.createForm.name = '   '
    await vm.submitCreate()

    expect(vm.createError.value).toBeTruthy()
    expect(deps.createCategoryUseCase.execute).not.toHaveBeenCalled()
  })

  it('edits a category name inline', async () => {
    const deps = makeDeps()
    const vm = createExpenseCategoriesViewModel(deps)

    await vm.loadCategories()
    vm.startEdit(vm.categories.value[0]!)
    vm.editForm.name = 'Materiales'
    await vm.submitEdit()

    expect(deps.updateCategoryUseCase.execute).toHaveBeenCalledWith('cat_1', { name: 'Materiales' })
    expect(vm.editingId.value).toBeNull()
  })

  it('deactivates a category', async () => {
    const deps = makeDeps()
    const vm = createExpenseCategoriesViewModel(deps)

    await vm.loadCategories()
    await vm.deactivate('cat_1')

    expect(deps.updateCategoryUseCase.execute).toHaveBeenCalledWith('cat_1', { isActive: false })
  })

  it('reactivates a category', async () => {
    const deps = makeDeps([makeCategory({ isActive: false })])
    const vm = createExpenseCategoriesViewModel(deps)

    await vm.loadCategories()
    await vm.reactivate('cat_1')

    expect(deps.updateCategoryUseCase.execute).toHaveBeenCalledWith('cat_1', { isActive: true })
  })
})
