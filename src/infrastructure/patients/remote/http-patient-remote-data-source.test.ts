import { afterEach, describe, expect, it, vi } from 'vitest'
import { HttpPatientRemoteDataSource } from './http-patient-remote-data-source'

describe('HttpPatientRemoteDataSource', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('passes search, filter and pagination query params to api', async () => {
    const $fetch = vi.fn().mockResolvedValue({
      items: [],
      total: 0,
      allTotal: 0,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    })

    vi.stubGlobal('$fetch', $fetch)

    const dataSource = new HttpPatientRemoteDataSource()

    await dataSource.listPatients({
      search: 'Andy',
      filter: 'follow_up',
      page: 2,
      pageSize: 20,
    })

    expect($fetch).toHaveBeenCalledWith('/api/patients', {
      query: {
        search: 'Andy',
        filter: 'follow_up',
        page: 2,
        pageSize: 20,
      },
    })
  })
})
