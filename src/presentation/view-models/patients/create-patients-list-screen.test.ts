import { afterEach, describe, expect, it, vi } from 'vitest'
import { createPatientsListScreen } from './create-patients-list-screen'
import type { PatientListResult } from '~~/src/application/dto/patient-management'

const makePatient = (name: string) => ({
  id: `patient_${name}`,
  organizationId: 'org_1',
  fullName: name,
  phone: '999888777',
  email: null,
  birthDate: null,
  documentId: null,
  administrativeNotes: null,
  isUrgent: false,
  hasUrgentAppointment: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
})

const makeResult = (overrides: Partial<PatientListResult> = {}): PatientListResult => ({
  items: [makePatient('Ana Torres')],
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

describe('createPatientsListScreen', () => {
  it('loads patients through use case with initial paging state', async () => {
    const execute = vi.fn().mockResolvedValue(makeResult())
    const screen = createPatientsListScreen({
      listPatientsUseCase: {
        execute,
      },
    })

    await screen.loadPatients()

    expect(execute).toHaveBeenCalledWith({
      search: '',
      filter: 'all',
      page: 1,
      pageSize: 10,
    })
    expect(screen.patients.value).toHaveLength(1)
    expect(screen.totalLabel.value).toBe('4 pacientes · ORL')
  })

  it('changes filter, resets page, reloads patients', async () => {
    const execute = vi
      .fn()
      .mockResolvedValueOnce(makeResult({ page: 2, totalPages: 3 }))
      .mockResolvedValueOnce(makeResult({ items: [makePatient('Lienny')], page: 1 }))

    const screen = createPatientsListScreen({
      listPatientsUseCase: { execute },
      initialPage: 2,
    })

    await screen.loadPatients()
    await screen.selectFilter('urgent')

    expect(screen.page.value).toBe(1)
    expect(execute).toHaveBeenLastCalledWith({
      search: '',
      filter: 'urgent',
      page: 1,
      pageSize: 10,
    })
  })

  it('debounces search, resets page, reloads patients', async () => {
    vi.useFakeTimers()

    const execute = vi
      .fn()
      .mockResolvedValueOnce(makeResult({ page: 3, totalPages: 3 }))
      .mockResolvedValueOnce(makeResult({ items: [makePatient('Andy Romero')], total: 1, page: 1 }))

    const screen = createPatientsListScreen({
      listPatientsUseCase: { execute },
      initialPage: 3,
    })

    await screen.loadPatients()
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

  it('moves to next and previous page', async () => {
    const execute = vi
      .fn()
      .mockResolvedValueOnce(makeResult({ page: 1, totalPages: 3 }))
      .mockResolvedValueOnce(makeResult({ page: 2, totalPages: 3 }))
      .mockResolvedValueOnce(makeResult({ page: 1, totalPages: 3 }))

    const screen = createPatientsListScreen({
      listPatientsUseCase: { execute },
    })

    await screen.loadPatients()
    await screen.goToNextPage()
    await screen.goToPreviousPage()

    expect(execute).toHaveBeenNthCalledWith(2, {
      search: '',
      filter: 'all',
      page: 2,
      pageSize: 10,
    })
    expect(execute).toHaveBeenNthCalledWith(3, {
      search: '',
      filter: 'all',
      page: 1,
      pageSize: 10,
    })
  })

  it('normalizes unauthorized error to stable hydration-safe message', async () => {
    const execute = vi.fn().mockRejectedValue({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })

    const screen = createPatientsListScreen({
      listPatientsUseCase: { execute },
    })

    await screen.loadPatients()

    expect(screen.errorMessage.value).toBe('No se pudo cargar la lista de pacientes.')
  })
})
