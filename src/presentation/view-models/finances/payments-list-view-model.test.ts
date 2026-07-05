import { describe, expect, it, vi } from 'vitest'
import { createPaymentsListViewModel } from './payments-list-view-model'
import type { PaymentListPageResult } from '~~/src/domain/repositories/payment-repository'

const makePayment = () => ({
  id: 'pay_1',
  organizationId: 'org_1',
  patientId: null,
  appointmentId: null,
  consultationId: null,
  amount: 350,
  method: 'efectivo' as const,
  concept: 'Consulta',
  paidAt: new Date('2026-07-05T15:00:00.000Z'),
  notes: null,
  createdBy: 'user_1',
  createdAt: new Date(),
  updatedAt: new Date(),
  patientName: null,
})

const makeResult = (overrides: Partial<PaymentListPageResult> = {}): PaymentListPageResult => ({
  items: [makePayment()],
  total: 1,
  page: 1,
  pageSize: 10,
  totalPages: 1,
  ...overrides,
})

describe('createPaymentsListViewModel', () => {
  it('loads payments through use case with initial paging state', async () => {
    const execute = vi.fn().mockResolvedValue(makeResult())
    const screen = createPaymentsListViewModel({ listPaymentsUseCase: { execute } })

    await screen.loadPayments()

    expect(execute).toHaveBeenCalledWith({ method: undefined, page: 1, pageSize: 10 })
    expect(screen.payments.value).toHaveLength(1)
    expect(screen.total.value).toBe(1)
  })

  it('applies method filter, resets page, reloads payments', async () => {
    const execute = vi
      .fn()
      .mockResolvedValueOnce(makeResult({ page: 2, totalPages: 3 }))
      .mockResolvedValueOnce(makeResult({ items: [], total: 0, page: 1 }))

    const screen = createPaymentsListViewModel({
      listPaymentsUseCase: { execute },
      initialPage: 2,
    })

    await screen.loadPayments()
    await screen.selectMethod('tarjeta')

    expect(screen.page.value).toBe(1)
    expect(execute).toHaveBeenLastCalledWith({ method: 'tarjeta', page: 1, pageSize: 10 })
  })

  it('does not reload if same method is selected again', async () => {
    const execute = vi.fn().mockResolvedValue(makeResult())
    const screen = createPaymentsListViewModel({ listPaymentsUseCase: { execute } })

    await screen.loadPayments()
    await screen.selectMethod(null)

    expect(execute).toHaveBeenCalledTimes(1)
  })

  it('navigates to next and previous page', async () => {
    const execute = vi
      .fn()
      .mockResolvedValueOnce(makeResult({ page: 1, totalPages: 3 }))
      .mockResolvedValueOnce(makeResult({ page: 2, totalPages: 3 }))
      .mockResolvedValueOnce(makeResult({ page: 1, totalPages: 3 }))

    const screen = createPaymentsListViewModel({ listPaymentsUseCase: { execute } })

    await screen.loadPayments()
    await screen.goToNextPage()
    await screen.goToPreviousPage()

    expect(execute).toHaveBeenNthCalledWith(2, expect.objectContaining({ page: 2 }))
    expect(execute).toHaveBeenNthCalledWith(3, expect.objectContaining({ page: 1 }))
  })

  it('shows error message on failed load', async () => {
    const execute = vi.fn().mockRejectedValue({ statusCode: 401, statusMessage: 'Unauthorized' })
    const screen = createPaymentsListViewModel({ listPaymentsUseCase: { execute } })

    await screen.loadPayments()

    expect(screen.errorMessage.value).toBe('No se pudo cargar la lista de pagos.')
    expect(screen.payments.value).toHaveLength(0)
  })
})
