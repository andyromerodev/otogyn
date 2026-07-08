import { afterEach, describe, expect, it, vi } from 'vitest'
import { createAppointmentCreateViewModel } from './appointment-create-view-model'

const ana = {
  id: 'patient_1',
  organizationId: 'org_1',
  fullName: 'Ana Torres',
  phone: '555-0001',
  email: 'ana@test.com',
  birthDate: null,
  documentId: null,
  administrativeNotes: null,
  isUrgent: false,
  createdAt: new Date('2026-07-01T12:00:00.000Z'),
  updatedAt: new Date('2026-07-01T12:00:00.000Z'),
  deletedAt: null,
}

const bruno = {
  ...ana,
  id: 'patient_2',
  fullName: 'Bruno Diaz',
  email: 'bruno@test.com',
}

const consultService = {
  id: 'service_1',
  organizationId: 'org_1',
  name: 'Consulta ORL',
  description: null,
  defaultDurationMinutes: 30,
  price: 650,
  isActive: true,
  createdAt: new Date('2026-07-01T12:00:00.000Z'),
  updatedAt: new Date('2026-07-01T12:00:00.000Z'),
}

const surgeryService = {
  ...consultService,
  id: 'service_2',
  name: 'Cirugia nasal',
  defaultDurationMinutes: 60,
  price: 1200,
}

const services = [consultService, surgeryService]

const calendarMonth = {
  monthStart: '2026-07-01',
  monthEnd: '2026-07-31',
  selectedDate: '2026-07-06',
  days: [
    {
      date: '2026-07-06',
      dayOfMonth: 6,
      isCurrentMonth: true,
      isToday: false,
      hasAppointments: false,
      appointmentsCount: 0,
    },
    {
      date: '2026-07-07',
      dayOfMonth: 7,
      isCurrentMonth: true,
      isToday: false,
      hasAppointments: false,
      appointmentsCount: 0,
    },
  ],
}

const morningSlot = {
  startsAt: '2026-07-06T14:00:00.000Z',
  endsAt: '2026-07-06T14:30:00.000Z',
  durationMinutes: 30,
  serviceId: 'service_1',
}

const noonSlot = {
  startsAt: '2026-07-07T15:00:00.000Z',
  endsAt: '2026-07-07T15:30:00.000Z',
  durationMinutes: 30,
  serviceId: 'service_1',
}

const makeDeps = (overrides?: {
  listAppointmentPatientsUseCase?: { execute: ReturnType<typeof vi.fn> }
  listAppointmentServicesUseCase?: { execute: ReturnType<typeof vi.fn> }
  getCalendarMonthUseCase?: { execute: ReturnType<typeof vi.fn> }
  getAppointmentAvailableSlotsUseCase?: { execute: ReturnType<typeof vi.fn> }
  createAppointmentUseCase?: { execute: ReturnType<typeof vi.fn> }
}) => ({
  listAppointmentPatientsUseCase:
    overrides?.listAppointmentPatientsUseCase ?? { execute: vi.fn().mockResolvedValue([ana, bruno]) },
  listAppointmentServicesUseCase:
    overrides?.listAppointmentServicesUseCase ?? { execute: vi.fn().mockResolvedValue(services) },
  getCalendarMonthUseCase:
    overrides?.getCalendarMonthUseCase ?? { execute: vi.fn().mockResolvedValue(calendarMonth) },
  getAppointmentAvailableSlotsUseCase:
    overrides?.getAppointmentAvailableSlotsUseCase ?? { execute: vi.fn().mockResolvedValue([morningSlot]) },
  createAppointmentUseCase:
    overrides?.createAppointmentUseCase ?? { execute: vi.fn().mockResolvedValue({ id: 'appointment_1' }) },
})

afterEach(() => {
  vi.useRealTimers()
})

describe('createAppointmentCreateViewModel', () => {
  it('loads patients and selects the first one by default', async () => {
    const listAppointmentPatientsUseCase = {
      execute: vi.fn().mockResolvedValue([ana, bruno]),
    }
    const screen = createAppointmentCreateViewModel({
      ...makeDeps(),
      listAppointmentPatientsUseCase,
    })

    await screen.loadFormOptions()

    expect(listAppointmentPatientsUseCase.execute).toHaveBeenCalledWith({ search: '' })
    expect(screen.hasPatientsAvailable.value).toBe(true)
    expect(screen.form.patientId).toBe('patient_1')
    expect(screen.selectedPatient.value?.fullName).toBe('Ana Torres')
    expect(screen.patientSearch.value).toBe('')
  })

  it('searches patients remotely with debounce and keeps selection when still present', async () => {
    vi.useFakeTimers()

    const listAppointmentPatientsUseCase = {
      execute: vi.fn().mockImplementation(async (query?: { search?: string }) => {
        if (query?.search?.toLowerCase() === 'ana') return [ana]
        return [ana, bruno]
      }),
    }
    const screen = createAppointmentCreateViewModel({
      ...makeDeps(),
      listAppointmentPatientsUseCase,
    })

    await screen.loadFormOptions()
    screen.selectPatient(ana)
    screen.patientSearch.value = 'Ana'
    await vi.advanceTimersByTimeAsync(260)

    expect(listAppointmentPatientsUseCase.execute).toHaveBeenLastCalledWith({ search: 'Ana' })
    expect(screen.form.patientId).toBe('patient_1')
    expect(screen.selectedPatient.value?.fullName).toBe('Ana Torres')
    expect(screen.patients.value).toEqual([ana])
  })

  it('keeps the current patient selection when a search has no matches', async () => {
    vi.useFakeTimers()

    const listAppointmentPatientsUseCase = {
      execute: vi.fn().mockImplementation(async (query?: { search?: string }) => {
        if (query?.search?.toLowerCase() === 'zzz') return []
        return [ana, bruno]
      }),
    }
    const screen = createAppointmentCreateViewModel({
      ...makeDeps(),
      listAppointmentPatientsUseCase,
    })

    await screen.loadFormOptions()
    screen.selectPatient(bruno)
    screen.patientSearch.value = 'zzz'
    await vi.advanceTimersByTimeAsync(260)

    expect(screen.patients.value).toEqual([])
    expect(screen.form.patientId).toBe('patient_2')
    expect(screen.selectedPatient.value?.id).toBe('patient_2')
  })

  it('searches services remotely with debounce and updates agreed price when selecting a new service', async () => {
    vi.useFakeTimers()

    const listAppointmentServicesUseCase = {
      execute: vi.fn().mockImplementation(async (query?: { search?: string }) => {
        if (query?.search?.toLowerCase() === 'ciru') return [surgeryService]
        return services
      }),
    }
    const screen = createAppointmentCreateViewModel({
      ...makeDeps(),
      listAppointmentServicesUseCase,
    })

    await screen.loadFormOptions()
    screen.serviceSearch.value = 'Ciru'
    await vi.advanceTimersByTimeAsync(260)
    screen.selectService(surgeryService)

    expect(listAppointmentServicesUseCase.execute).toHaveBeenLastCalledWith({ search: 'Ciru' })
    expect(screen.form.serviceId).toBe('service_2')
    expect(screen.selectedService.value?.name).toBe('Cirugia nasal')
    expect(screen.form.agreedPrice).toBe(1200)
  })

  it('preserves a manually edited agreed price when switching searched services', async () => {
    const screen = createAppointmentCreateViewModel(makeDeps())

    await screen.loadFormOptions()
    screen.form.agreedPrice = 777
    screen.selectService(surgeryService)

    expect(screen.form.agreedPrice).toBe(777)
  })

  it('loads calendar month and slots, and requires a slot before submit', async () => {
    const getCalendarMonthUseCase = { execute: vi.fn().mockResolvedValue(calendarMonth) }
    const getAppointmentAvailableSlotsUseCase = { execute: vi.fn().mockResolvedValue([morningSlot]) }
    const createAppointmentUseCase = { execute: vi.fn().mockResolvedValue({ id: 'appointment_1' }) }
    const screen = createAppointmentCreateViewModel(makeDeps({
      getCalendarMonthUseCase,
      getAppointmentAvailableSlotsUseCase,
      createAppointmentUseCase,
    }))

    await screen.loadFormOptions()

    expect(getCalendarMonthUseCase.execute).toHaveBeenCalled()
    expect(getAppointmentAvailableSlotsUseCase.execute).toHaveBeenCalledWith({
      date: screen.selectedDate.value,
      serviceId: 'service_1',
    })

    await screen.submitAppointment()
    expect(screen.errorMessage.value).toBe('Debes elegir una fecha y un horario disponible.')
    expect(createAppointmentUseCase.execute).not.toHaveBeenCalled()
  })

  it('reloads slots when changing date and clears an invalid previous slot', async () => {
    const getAppointmentAvailableSlotsUseCase = {
      execute: vi.fn().mockImplementation(async (query: { date: string }) => {
        if (query.date === '2026-07-07') return [noonSlot]
        return [morningSlot]
      }),
    }
    const screen = createAppointmentCreateViewModel(makeDeps({
      getAppointmentAvailableSlotsUseCase,
    }))

    await screen.loadFormOptions()
    screen.selectSlot(morningSlot.startsAt)
    await screen.selectDate('2026-07-07')

    expect(screen.selectedSlotStartsAt.value).toBeNull()
    expect(screen.form.startAt).toBe('2026-07-07T09:00')
    expect(screen.availableSlots.value).toEqual([noonSlot])
  })

  it('builds startAt from the selected slot on submit', async () => {
    const createAppointmentUseCase = { execute: vi.fn().mockResolvedValue({ id: 'appointment_1' }) }
    const screen = createAppointmentCreateViewModel(makeDeps({
      createAppointmentUseCase,
    }))

    await screen.loadFormOptions()
    screen.selectSlot(morningSlot.startsAt)
    await screen.submitAppointment()

    expect(createAppointmentUseCase.execute).toHaveBeenCalledWith(expect.objectContaining({
      startAt: morningSlot.startsAt,
      patientId: 'patient_1',
      serviceId: 'service_1',
    }))
  })

  it('keeps selected patient when the user edits the search text manually', async () => {
    vi.useFakeTimers()

    const screen = createAppointmentCreateViewModel(makeDeps({
      listAppointmentPatientsUseCase: {
        execute: vi.fn().mockImplementation(async (query?: { search?: string }) => {
          if (query?.search === 'Paciente distinto') return []
          return [ana, bruno]
        }),
      },
    }))

    await screen.loadFormOptions()
    screen.patientSearch.value = 'Paciente distinto'
    await vi.advanceTimersByTimeAsync(260)

    expect(screen.selectedPatient.value?.id).toBe('patient_1')
    expect(screen.form.patientId).toBe('patient_1')
  })

  it('keeps selected service and slots when the user edits the service text manually', async () => {
    vi.useFakeTimers()

    const screen = createAppointmentCreateViewModel(makeDeps({
      listAppointmentServicesUseCase: {
        execute: vi.fn().mockImplementation(async (query?: { search?: string }) => {
          if (query?.search === 'Otro servicio') return []
          return services
        }),
      },
    }))

    await screen.loadFormOptions()
    screen.selectSlot(morningSlot.startsAt)
    screen.serviceSearch.value = 'Otro servicio'
    await vi.advanceTimersByTimeAsync(260)

    expect(screen.selectedService.value?.id).toBe('service_1')
    expect(screen.form.serviceId).toBe('service_1')
    expect(screen.availableSlots.value).toEqual([morningSlot])
    expect(screen.selectedSlotStartsAt.value).toBe(morningSlot.startsAt)
  })

  it('closes patient picker after selecting a patient', async () => {
    const screen = createAppointmentCreateViewModel(makeDeps())

    await screen.loadFormOptions()
    screen.isPatientPickerOpen.value = true
    screen.selectPatient(bruno)

    expect(screen.selectedPatient.value?.id).toBe('patient_2')
    expect(screen.isPatientPickerOpen.value).toBe(false)
    expect(screen.patientSearch.value).toBe('')
  })

  it('closes service picker after selecting a service', async () => {
    const screen = createAppointmentCreateViewModel(makeDeps())

    await screen.loadFormOptions()
    screen.isServicePickerOpen.value = true
    screen.selectService(surgeryService)

    expect(screen.selectedService.value?.id).toBe('service_2')
    expect(screen.isServicePickerOpen.value).toBe(false)
    expect(screen.serviceSearch.value).toBe('')
  })

  it('opens patient picker without altering current selection', async () => {
    const screen = createAppointmentCreateViewModel(makeDeps())

    await screen.loadFormOptions()
    await screen.openPatientPicker()

    expect(screen.isPatientPickerOpen.value).toBe(true)
    expect(screen.form.patientId).toBe('patient_1')
    expect(screen.patientSearch.value).toBe('')
  })

  it('opens service picker without altering current selection', async () => {
    const screen = createAppointmentCreateViewModel(makeDeps())

    await screen.loadFormOptions()
    await screen.openServicePicker()

    expect(screen.isServicePickerOpen.value).toBe(true)
    expect(screen.form.serviceId).toBe('service_1')
    expect(screen.serviceSearch.value).toBe('')
  })
})
