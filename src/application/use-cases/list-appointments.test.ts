import { describe, expect, it, vi } from 'vitest'
import { ListAppointmentsUseCase } from './list-appointments'
import type { AppointmentRepository } from '../../domain/repositories/appointment-repository'

const makeRepository = () => ({
  listPage: vi.fn().mockResolvedValue({
    items: [],
    total: 0,
    allTotal: 0,
    page: 1,
    pageSize: 10,
    totalPages: 1,
  }),
}) as unknown as AppointmentRepository & {
  listPage: ReturnType<typeof vi.fn>
}

describe('ListAppointmentsUseCase', () => {
  it('lists all appointments without a date range by default', async () => {
    const repository = makeRepository()
    const useCase = new ListAppointmentsUseCase(repository)

    await useCase.execute({
      organizationId: 'org_1',
      search: 'tos',
      page: 2,
      pageSize: 20,
      now: new Date('2026-07-02T16:00:00.000Z'),
    })

    expect(repository.listPage).toHaveBeenCalledWith({
      organizationId: 'org_1',
      search: 'tos',
      page: 2,
      pageSize: 20,
    })
  })

  it('resolves today using Lima day bounds', async () => {
    const repository = makeRepository()
    const useCase = new ListAppointmentsUseCase(repository)

    await useCase.execute({
      organizationId: 'org_1',
      filter: 'today',
      now: new Date('2026-07-02T16:00:00.000Z'),
    })

    expect(repository.listPage).toHaveBeenCalledWith({
      organizationId: 'org_1',
      search: '',
      page: 1,
      pageSize: 10,
      startAtFrom: new Date('2026-07-02T05:00:00.000Z'),
      startAtTo: new Date('2026-07-03T05:00:00.000Z'),
    })
  })

  it('resolves current and previous week using Lima calendar weeks', async () => {
    const repository = makeRepository()
    const useCase = new ListAppointmentsUseCase(repository)
    const now = new Date('2026-07-02T16:00:00.000Z')

    await useCase.execute({ organizationId: 'org_1', filter: 'current_week', now })
    await useCase.execute({ organizationId: 'org_1', filter: 'last_week', now })

    expect(repository.listPage).toHaveBeenNthCalledWith(1, {
      organizationId: 'org_1',
      search: '',
      page: 1,
      pageSize: 10,
      startAtFrom: new Date('2026-06-29T05:00:00.000Z'),
      startAtTo: new Date('2026-07-06T05:00:00.000Z'),
    })
    expect(repository.listPage).toHaveBeenNthCalledWith(2, {
      organizationId: 'org_1',
      search: '',
      page: 1,
      pageSize: 10,
      startAtFrom: new Date('2026-06-22T05:00:00.000Z'),
      startAtTo: new Date('2026-06-29T05:00:00.000Z'),
    })
  })

  it('resolves current and previous month using Lima calendar months', async () => {
    const repository = makeRepository()
    const useCase = new ListAppointmentsUseCase(repository)
    const now = new Date('2026-07-02T16:00:00.000Z')

    await useCase.execute({ organizationId: 'org_1', filter: 'current_month', now })
    await useCase.execute({ organizationId: 'org_1', filter: 'last_month', now })

    expect(repository.listPage).toHaveBeenNthCalledWith(1, {
      organizationId: 'org_1',
      search: '',
      page: 1,
      pageSize: 10,
      startAtFrom: new Date('2026-07-01T05:00:00.000Z'),
      startAtTo: new Date('2026-08-01T05:00:00.000Z'),
    })
    expect(repository.listPage).toHaveBeenNthCalledWith(2, {
      organizationId: 'org_1',
      search: '',
      page: 1,
      pageSize: 10,
      startAtFrom: new Date('2026-06-01T05:00:00.000Z'),
      startAtTo: new Date('2026-07-01T05:00:00.000Z'),
    })
  })
})
