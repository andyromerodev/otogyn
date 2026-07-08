import { afterEach, describe, expect, it, vi } from 'vitest'
import type { AppointmentListResult } from '../../../application/dto/appointment-management'
import { createAppointmentsListViewModel } from './appointments-list-view-model'

const makeAppointment = (id = 'appointment_1') => ({
  id,
  patientId: 'patient_1',
  serviceId: 'service_1',
  professionalId: null,
  patientName: 'Andy Romero',
  serviceName: 'Consulta ORL',
  startAt: '2026-07-02T14:00:00.000Z',
  endAt: '2026-07-02T14:15:00.000Z',
  timeLabel: '09:00 - 09:15',
  status: 'scheduled' as const,
  statusLabel: 'Programada',
  isUrgent: false,
  reason: null,
  notes: null,
  paymentStatus: 'pending' as const,
  linkedPayment: null,
})

const makeResult = (overrides: Partial<AppointmentListResult> = {}): AppointmentListResult => ({
  items: [makeAppointment()],
  total: 1,
  allTotal: 4,
  page: 1,
  pageSize: 10,
  totalPages: 1,
  ...overrides,
})

afterEach(() => {
  vi.useRealTimers()
})

describe('createAppointmentsListViewModel', () => {
  it('loads appointments with default all filter and paging state', async () => {
    const execute = vi.fn().mockResolvedValue(makeResult())
    const screen = createAppointmentsListViewModel({
      listAppointmentsUseCase: { execute },
      getAppointmentSessionContextUseCase: { execute: vi.fn() },
    })

    await screen.loadAppointments()

    expect(execute).toHaveBeenCalledWith({
      search: '',
      filter: 'all',
      page: 1,
      pageSize: 10,
    })
    expect(screen.appointments.value).toHaveLength(1)
    expect(screen.totalLabel.value).toBe('4 citas · Agenda')
  })

  it('changes filter, resets page and reloads appointments', async () => {
    const execute = vi
      .fn()
      .mockResolvedValueOnce(makeResult({ page: 3, totalPages: 4 }))
      .mockResolvedValueOnce(makeResult({ page: 1, totalPages: 2 }))
    const screen = createAppointmentsListViewModel({
      listAppointmentsUseCase: { execute },
      getAppointmentSessionContextUseCase: { execute: vi.fn() },
      initialPage: 3,
    })

    await screen.loadAppointments()
    await screen.selectFilter('current_week')

    expect(screen.page.value).toBe(1)
    expect(execute).toHaveBeenLastCalledWith({
      search: '',
      filter: 'current_week',
      page: 1,
      pageSize: 10,
    })
  })

  it('debounces search, resets page and reloads appointments', async () => {
    vi.useFakeTimers()

    const execute = vi
      .fn()
      .mockResolvedValueOnce(makeResult({ page: 2, totalPages: 3 }))
      .mockResolvedValueOnce(makeResult({ items: [makeAppointment('appointment_2')], total: 1, page: 1 }))
    const screen = createAppointmentsListViewModel({
      listAppointmentsUseCase: { execute },
      getAppointmentSessionContextUseCase: { execute: vi.fn() },
      initialPage: 2,
    })

    await screen.loadAppointments()
    screen.searchTerm.value = 'Andy'
    await vi.advanceTimersByTimeAsync(260)

    expect(screen.page.value).toBe(1)
    expect(execute).toHaveBeenLastCalledWith({
      search: 'Andy',
      filter: 'all',
      page: 1,
      pageSize: 10,
    })
  })

  it('moves to next and previous page with current filters', async () => {
    const execute = vi
      .fn()
      .mockResolvedValueOnce(makeResult({ page: 1, totalPages: 3 }))
      .mockResolvedValueOnce(makeResult({ page: 2, totalPages: 3 }))
      .mockResolvedValueOnce(makeResult({ page: 1, totalPages: 3 }))
    const screen = createAppointmentsListViewModel({
      listAppointmentsUseCase: { execute },
      getAppointmentSessionContextUseCase: { execute: vi.fn() },
      initialFilter: 'last_month',
    })

    await screen.loadAppointments()
    await screen.goToNextPage()
    await screen.goToPreviousPage()

    expect(execute).toHaveBeenNthCalledWith(2, {
      search: '',
      filter: 'last_month',
      page: 2,
      pageSize: 10,
    })
    expect(execute).toHaveBeenNthCalledWith(3, {
      search: '',
      filter: 'last_month',
      page: 1,
      pageSize: 10,
    })
  })
})
