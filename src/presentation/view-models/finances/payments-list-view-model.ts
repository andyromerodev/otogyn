import { computed, ref } from 'vue'
import type { PaymentMethod } from '~~/src/domain/entities/payment'
import type { PaymentListItem } from '~~/src/domain/repositories/payment-repository'
import type { PaymentsListViewModelDependencies } from './payments-list-view-model.module'

export type { PaymentsListViewModelDependencies } from './payments-list-view-model.module'

const resolveListPaymentsErrorMessage = (error: unknown) => {
  const statusCode =
    error && typeof error === 'object' && 'statusCode' in error && typeof error.statusCode === 'number'
      ? error.statusCode
      : null

  console.error('[finances][payments][list] load failed', {
    env: import.meta.server ? 'server' : 'client',
    statusCode,
    message: error instanceof Error ? error.message : null,
  })

  return 'No se pudo cargar la lista de pagos.'
}

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount)

export const formatDate = (date: Date | string) =>
  new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'America/Mexico_City',
  }).format(new Date(date))

export const methodLabels: Record<PaymentMethod, string> = {
  efectivo: 'Efectivo',
  tarjeta: 'Tarjeta',
  transferencia: 'Transferencia',
}

export const createPaymentsListViewModel = (deps: PaymentsListViewModelDependencies) => {
  const payments = ref<PaymentListItem[]>([])
  const loading = ref(false)
  const errorMessage = ref<string | null>(null)
  const methodFilter = ref<PaymentMethod | null>(deps.initialMethod ?? null)
  const page = ref(Math.max(deps.initialPage ?? 1, 1))
  const pageSize = ref(Math.max(deps.initialPageSize ?? 10, 1))
  const total = ref(0)
  const totalPages = ref(1)

  const loadPayments = async () => {
    loading.value = true
    errorMessage.value = null

    try {
      const result = await deps.listPaymentsUseCase.execute({
        method: methodFilter.value ?? undefined,
        page: page.value,
        pageSize: pageSize.value,
      })

      payments.value = result.items
      total.value = result.total
      page.value = result.page
      pageSize.value = result.pageSize
      totalPages.value = result.totalPages
    } catch (error) {
      errorMessage.value = resolveListPaymentsErrorMessage(error)
    } finally {
      loading.value = false
    }
  }

  const hasNext = computed(() => page.value < totalPages.value)
  const hasPrevious = computed(() => page.value > 1)

  const emptyStateMessage = computed(() =>
    total.value === 0 ? 'Aún no hay pagos registrados.' : 'No se encontraron pagos con estos filtros.',
  )

  const methodChips = computed(() => [
    { key: null as PaymentMethod | null, label: 'Todos' },
    { key: 'efectivo' as PaymentMethod, label: 'Efectivo' },
    { key: 'tarjeta' as PaymentMethod, label: 'Tarjeta' },
    { key: 'transferencia' as PaymentMethod, label: 'Transferencia' },
  ])

  const exportHref = computed(() => {
    const params = new URLSearchParams({ type: 'payments' })

    if (methodFilter.value) {
      params.set('method', methodFilter.value)
    }

    return `/api/finances/export?${params.toString()}`
  })

  const selectMethod = async (method: PaymentMethod | null) => {
    if (methodFilter.value === method) return
    methodFilter.value = method
    page.value = 1
    await loadPayments()
  }

  const goToPage = async (nextPage: number) => {
    if (nextPage === page.value || nextPage < 1 || nextPage > totalPages.value) return
    page.value = nextPage
    await loadPayments()
  }

  const goToNextPage = async () => { if (hasNext.value) await goToPage(page.value + 1) }
  const goToPreviousPage = async () => { if (hasPrevious.value) await goToPage(page.value - 1) }

  return {
    payments,
    loading,
    errorMessage,
    methodFilter,
    page,
    pageSize,
    total,
    totalPages,
    hasNext,
    hasPrevious,
    emptyStateMessage,
    methodChips,
    exportHref,
    loadPayments,
    selectMethod,
    goToPage,
    goToNextPage,
    goToPreviousPage,
  }
}
