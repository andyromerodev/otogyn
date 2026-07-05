import { describe, expect, it, vi } from 'vitest'
import { createExpensesListViewModel } from './expenses-list-view-model'
import type { ExpenseListPageResult } from '~~/src/domain/repositories/expense-repository'
import type { ExpenseCategory } from '~~/src/domain/entities/expense-category'

const makeCategory = (id: string, name: string): ExpenseCategory => ({
  id,
  organizationId: 'org_1',
  name,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
})

const makeExpense = () => ({
  id: 'exp_1',
  organizationId: 'org_1',
  categoryId: 'cat_1',
  categoryName: 'Suministros',
  amount: 500,
  description: 'Compra de guantes',
  expenseDate: new Date('2026-07-05T10:00:00.000Z'),
  notes: null,
  createdBy: 'user_1',
  createdAt: new Date(),
  updatedAt: new Date(),
})

const makeResult = (overrides: Partial<ExpenseListPageResult> = {}): ExpenseListPageResult => ({
  items: [makeExpense()],
  total: 1,
  page: 1,
  pageSize: 10,
  totalPages: 1,
  ...overrides,
})

const makeDeps = (resultOverride: Partial<ExpenseListPageResult> = {}) => ({
  listExpensesUseCase: { execute: vi.fn().mockResolvedValue(makeResult(resultOverride)) },
  listCategoriesUseCase: {
    execute: vi.fn().mockResolvedValue([makeCategory('cat_1', 'Suministros')]),
  },
})

describe('createExpensesListViewModel', () => {
  it('loads expenses and categories on loadAll', async () => {
    const deps = makeDeps()
    const screen = createExpensesListViewModel(deps)

    await screen.loadAll()

    expect(deps.listExpensesUseCase.execute).toHaveBeenCalledWith({
      categoryId: undefined,
      page: 1,
      pageSize: 10,
    })
    expect(deps.listCategoriesUseCase.execute).toHaveBeenCalledTimes(1)
    expect(screen.expenses.value).toHaveLength(1)
    expect(screen.categories.value).toHaveLength(1)
  })

  it('builds category chips including "Todos" prefix', async () => {
    const deps = makeDeps()
    const screen = createExpensesListViewModel(deps)

    await screen.loadAll()

    expect(screen.categoryChips.value[0]).toEqual({ key: null, label: 'Todos' })
    expect(screen.categoryChips.value[1]).toEqual({ key: 'cat_1', label: 'Suministros' })
  })

  it('filters by category, resets page, reloads', async () => {
    const deps = {
      listExpensesUseCase: vi
        .fn()
        .mockResolvedValueOnce(makeResult({ page: 2, totalPages: 3 }))
        .mockResolvedValueOnce(makeResult({ items: [], total: 0, page: 1 })),
      listCategoriesUseCase: { execute: vi.fn().mockResolvedValue([]) },
    }
    const screen = createExpensesListViewModel({
      listExpensesUseCase: { execute: deps.listExpensesUseCase },
      listCategoriesUseCase: deps.listCategoriesUseCase,
      initialPage: 2,
    })

    await screen.loadExpenses()
    await screen.selectCategory('cat_1')

    expect(screen.page.value).toBe(1)
    expect(deps.listExpensesUseCase).toHaveBeenLastCalledWith({
      categoryId: 'cat_1',
      page: 1,
      pageSize: 10,
    })
  })

  it('does not reload if same category is selected', async () => {
    const deps = makeDeps()
    const screen = createExpensesListViewModel(deps)

    await screen.loadExpenses()
    await screen.selectCategory(null)

    expect(deps.listExpensesUseCase.execute).toHaveBeenCalledTimes(1)
  })

  it('shows error message on failed load', async () => {
    const deps = {
      listExpensesUseCase: {
        execute: vi.fn().mockRejectedValue({ statusCode: 500, statusMessage: 'Server error' }),
      },
      listCategoriesUseCase: { execute: vi.fn().mockResolvedValue([]) },
    }
    const screen = createExpensesListViewModel(deps)

    await screen.loadExpenses()

    expect(screen.errorMessage.value).toBe('No se pudo cargar la lista de gastos.')
  })
})
