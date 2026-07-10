import { computed, ref, watch } from 'vue'
import type { ExpenseListItem } from '~~/src/domain/repositories/expense-repository'
import type { ExpenseCategory } from '~~/src/domain/entities/expense-category'
import type { ExpensesListViewModelDependencies } from './expenses-list-view-model.module'

export type { ExpensesListViewModelDependencies } from './expenses-list-view-model.module'

export const formatCurrencyMXN = (amount: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount)

export const formatDateMX = (date: Date | string) =>
  new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'America/Mexico_City',
  }).format(new Date(date))

const resolveError = (error: unknown) => {
  console.error('[finances][expenses][list] load failed', {
    env: import.meta.server ? 'server' : 'client',
    message: error instanceof Error ? error.message : null,
  })

  return 'No se pudo cargar la lista de gastos.'
}

export const createExpensesListViewModel = (deps: ExpensesListViewModelDependencies) => {
  const expenses = ref<ExpenseListItem[]>([])
  const categories = ref<ExpenseCategory[]>([])
  const loading = ref(false)
  const errorMessage = ref<string | null>(null)
  const categoryFilter = ref<string | null>(deps.initialCategoryId ?? null)
  const page = ref(Math.max(deps.initialPage ?? 1, 1))
  const pageSize = ref(Math.max(deps.initialPageSize ?? 10, 1))
  const total = ref(0)
  const totalPages = ref(1)
  const searchTerm = ref('')

  let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null
  watch(searchTerm, () => {
    if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
    searchDebounceTimer = setTimeout(() => {
      page.value = 1
      void loadExpenses()
    }, 250)
  })

  const loadCategories = async () => {
    try {
      categories.value = await deps.listCategoriesUseCase.execute()
    } catch {
      // Non-critical — list still works without category chips
    }
  }

  const loadExpenses = async () => {
    loading.value = true
    errorMessage.value = null

    try {
      const result = await deps.listExpensesUseCase.execute({
        categoryId: categoryFilter.value ?? undefined,
        page: page.value,
        pageSize: pageSize.value,
        search: searchTerm.value.trim() || undefined,
      })

      expenses.value = result.items
      total.value = result.total
      page.value = result.page
      pageSize.value = result.pageSize
      totalPages.value = result.totalPages
    } catch (error) {
      errorMessage.value = resolveError(error)
    } finally {
      loading.value = false
    }
  }

  const loadAll = async () => {
    await Promise.all([loadCategories(), loadExpenses()])
  }

  const hasNext = computed(() => page.value < totalPages.value)
  const hasPrevious = computed(() => page.value > 1)

  const emptyStateMessage = computed(() =>
    total.value === 0
      ? 'Aún no hay gastos registrados.'
      : 'No se encontraron gastos con estos filtros.',
  )

  const categoryChips = computed(() => [
    { key: null as string | null, label: 'Todos' },
    ...categories.value.map((c) => ({ key: c.id, label: c.name })),
  ])

  const exportHref = computed(() => {
    const params = new URLSearchParams({ type: 'expenses' })

    if (categoryFilter.value) {
      params.set('categoryId', categoryFilter.value)
    }

    return `/api/finances/export?${params.toString()}`
  })

  const selectCategory = async (categoryId: string | null) => {
    if (categoryFilter.value === categoryId) return
    categoryFilter.value = categoryId
    page.value = 1
    await loadExpenses()
  }

  const goToPage = async (nextPage: number) => {
    if (nextPage === page.value || nextPage < 1 || nextPage > totalPages.value) return
    page.value = nextPage
    await loadExpenses()
  }

  const goToNextPage = async () => { if (hasNext.value) await goToPage(page.value + 1) }
  const goToPreviousPage = async () => { if (hasPrevious.value) await goToPage(page.value - 1) }

  return {
    expenses,
    categories,
    loading,
    errorMessage,
    categoryFilter,
    page,
    pageSize,
    total,
    totalPages,
    hasNext,
    hasPrevious,
    emptyStateMessage,
    categoryChips,
    exportHref,
    searchTerm,
    loadAll,
    loadExpenses,
    selectCategory,
    goToPage,
    goToNextPage,
    goToPreviousPage,
  }
}
