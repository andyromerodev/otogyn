import { getQuery, setHeader } from 'h3'
import { financeExportQuerySchema } from '../../../src/presentation/validators/finance'
import { formatLocalDate } from '../../../src/application/utils/date/local-date'
import { requireAuthorizedUser } from '../../utils/authorization'
import { handleApiError } from '../../utils/handle-api-error'
import { serverServiceLocator } from '../../utils/server-service-locator'

const CSV_BOM = '\uFEFF'
const EXPORT_PAGE_SIZE = 50
const paymentMethodLabelMap = {
  efectivo: 'Efectivo',
  tarjeta: 'Tarjeta',
  transferencia: 'Transferencia',
} as const

const escapeCsvValue = (value: string | number | null | undefined) => {
  if (value === null || value === undefined) {
    return ''
  }

  const normalized = String(value)

  if (!/[",\n]/.test(normalized)) {
    return normalized
  }

  return `"${normalized.replaceAll('"', '""')}"`
}

const toCsv = (headers: string[], rows: Array<Array<string | number | null | undefined>>) =>
  [
    headers.map(escapeCsvValue).join(','),
    ...rows.map((row) => row.map(escapeCsvValue).join(',')),
  ].join('\n')

const collectAllPayments = async (input: {
  organizationId: string
  patientId?: string
  method?: 'efectivo' | 'tarjeta' | 'transferencia'
  paidAtFrom?: Date
  paidAtTo?: Date
}) => {
  const items: Awaited<ReturnType<typeof serverServiceLocator.finances.listPaymentsUseCase.execute>>['items'] = []
  let page = 1
  let totalPages = 1

  while (page <= totalPages) {
    const result = await serverServiceLocator.finances.listPaymentsUseCase.execute({
      ...input,
      page,
      pageSize: EXPORT_PAGE_SIZE,
    })

    items.push(...result.items)
    totalPages = result.totalPages
    page += 1
  }

  return items
}

const collectAllExpenses = async (input: {
  organizationId: string
  categoryId?: string
  expenseDateFrom?: Date
  expenseDateTo?: Date
}) => {
  const items: Awaited<ReturnType<typeof serverServiceLocator.finances.listExpensesUseCase.execute>>['items'] = []
  let page = 1
  let totalPages = 1

  while (page <= totalPages) {
    const result = await serverServiceLocator.finances.listExpensesUseCase.execute({
      ...input,
      page,
      pageSize: EXPORT_PAGE_SIZE,
    })

    items.push(...result.items)
    totalPages = result.totalPages
    page += 1
  }

  return items
}

export default defineEventHandler(async (event) => {
  try {
    const session = await requireAuthorizedUser(event, 'finances:read')
    const query = financeExportQuerySchema.parse(getQuery(event))

    const exportedAt = formatLocalDate(new Date())

    if (query.type === 'payments') {
      const payments = await collectAllPayments({
        organizationId: session.organizationId,
        patientId: query.patientId,
        method: query.method,
        paidAtFrom: query.from,
        paidAtTo: query.to,
      })

      const csv = toCsv(
        ['Fecha', 'Paciente', 'Concepto', 'Método', 'Monto', 'Notas', 'Cita', 'Consulta'],
        payments.map((payment) => [
          payment.paidAt.toISOString(),
          payment.patientName ?? '',
          payment.concept,
          paymentMethodLabelMap[payment.method],
          payment.amount.toFixed(2),
          payment.notes ?? '',
          payment.appointmentId ?? '',
          payment.consultationId ?? '',
        ]),
      )

      setHeader(event, 'Content-Type', 'text/csv; charset=utf-8')
      setHeader(
        event,
        'Content-Disposition',
        `attachment; filename="finanzas-pagos-${exportedAt}.csv"`,
      )

      return `${CSV_BOM}${csv}`
    }

    const expenses = await collectAllExpenses({
      organizationId: session.organizationId,
      categoryId: query.categoryId,
      expenseDateFrom: query.from,
      expenseDateTo: query.to,
    })

    const csv = toCsv(
      ['Fecha', 'Categoría', 'Descripción', 'Monto', 'Notas'],
      expenses.map((expense) => [
        expense.expenseDate.toISOString(),
        expense.categoryName,
        expense.description,
        expense.amount.toFixed(2),
        expense.notes ?? '',
      ]),
    )

    setHeader(event, 'Content-Type', 'text/csv; charset=utf-8')
    setHeader(
      event,
      'Content-Disposition',
      `attachment; filename="finanzas-gastos-${exportedAt}.csv"`,
    )

    return `${CSV_BOM}${csv}`
  } catch (error) {
    handleApiError(error)
  }
})
