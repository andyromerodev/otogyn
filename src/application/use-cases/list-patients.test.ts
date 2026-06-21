import { describe, expect, it, vi } from 'vitest'
import { ListPatientsUseCase } from './list-patients'

describe('ListPatientsUseCase', () => {
  it('normalizes paging and filter input before delegating to repository', async () => {
    const listPage = vi.fn().mockResolvedValue({
      items: [],
      total: 0,
      allTotal: 0,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    })

    const useCase = new ListPatientsUseCase({
      listByOrganization: vi.fn(),
      listPage,
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    })

    await useCase.execute({
      organizationId: 'org_1',
      search: '  Andy  ',
      filter: 'urgent',
      page: 2,
      pageSize: 20,
    })

    expect(listPage).toHaveBeenCalledWith({
      organizationId: 'org_1',
      search: 'Andy',
      filter: 'urgent',
      page: 2,
      pageSize: 20,
    })
  })
})
