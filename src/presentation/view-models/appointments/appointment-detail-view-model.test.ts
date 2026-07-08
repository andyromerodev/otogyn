import { describe, expect, it, vi } from 'vitest'
import { createAppointmentDetailViewModel } from './appointment-detail-view-model'

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

const calendarMonth = {
  monthStart: '2026-07-01',
  monthEnd: '2026-07-31',
  selectedDate: '2026-07-07',
  days: [
    { date: '2026-07-07', dayOfMonth: 7, isCurrentMonth: true, isToday: false, hasAppointments: false, appointmentsCount: 0 },
    { date: '2026-07-08', dayOfMonth: 8, isCurrentMonth: true, isToday: false, hasAppointments: false, appointmentsCount: 0 },
  ],
}

const makeAppointment = (overrides: Record<string, unknown> = {}) => ({
  id: 'appointment_1',
  patientId: 'patient_1',
  serviceId: 'service_1',
  professionalId: null,
  patientName: 'Ana Torres',
  serviceName: 'Consulta ORL',
  startAt: '2026-07-07T15:00:00.000Z',
  endAt: '2026-07-07T15:30:00.000Z',
  timeLabel: '10:00 - 10:30',
  status: 'scheduled' as const,
  statusLabel: 'Programada',
  isUrgent: false,
  reason: null,
  notes: null,
  agreedPrice: 650,
  linkedPayment: null,
  ...overrides,
})

const makeViewModel = (options?: {
  role?: 'admin_doctor' | 'assistant'
  appointmentOverrides?: Record<string, unknown>
  listAppointmentPatientsUseCase?: { execute: ReturnType<typeof vi.fn> }
  listAppointmentServicesUseCase?: { execute: ReturnType<typeof vi.fn> }
  getCalendarMonthUseCase?: { execute: ReturnType<typeof vi.fn> }
}) =>
  createAppointmentDetailViewModel({
    appointmentId: 'appointment_1',
    getAppointmentDetailUseCase: {
      execute: vi.fn().mockResolvedValue(makeAppointment(options?.appointmentOverrides)),
    },
    listAppointmentPatientsUseCase: options?.listAppointmentPatientsUseCase ?? { execute: vi.fn().mockResolvedValue([ana, bruno]) },
    listAppointmentServicesUseCase: options?.listAppointmentServicesUseCase ?? { execute: vi.fn().mockResolvedValue([consultService, surgeryService]) },
    getAppointmentSessionContextUseCase: {
      execute: vi.fn().mockResolvedValue({ role: options?.role ?? 'admin_doctor' }),
    },
    getCalendarMonthUseCase: options?.getCalendarMonthUseCase ?? { execute: vi.fn().mockResolvedValue(calendarMonth) },
    getAppointmentAvailableSlotsUseCase: { execute: vi.fn().mockResolvedValue([]) },
    updateAppointmentUseCase: { execute: vi.fn() },
    cancelAppointmentUseCase: { execute: vi.fn() },
    changeAppointmentStatusUseCase: { execute: vi.fn() },
  })

describe('appointment-detail-view-model', () => {
  it('allows registering a payment for admin doctor on an unpaid active appointment', async () => {
    const screen = makeViewModel()

    await Promise.all([screen.loadAppointment(), screen.loadSessionContext()])

    expect(screen.canRegisterPayment.value).toBe(true)
    expect(screen.registerPaymentHref.value).toBe('/finances/payments/new?appointmentId=appointment_1')
  })

  it('blocks registering a payment for assistants', async () => {
    const screen = makeViewModel({ role: 'assistant' })

    await Promise.all([screen.loadAppointment(), screen.loadSessionContext()])

    expect(screen.canRegisterPayment.value).toBe(false)
  })

  it('blocks registering a payment when the appointment is cancelled', async () => {
    const screen = makeViewModel({
      appointmentOverrides: { status: 'cancelled', statusLabel: 'Cancelada' },
    })

    await Promise.all([screen.loadAppointment(), screen.loadSessionContext()])

    expect(screen.canRegisterPayment.value).toBe(false)
  })

  it('blocks registering a payment when the appointment already has a linked payment', async () => {
    const screen = makeViewModel({
      appointmentOverrides: {
        linkedPayment: {
          id: 'payment_1',
          amount: 650,
          method: 'tarjeta',
          paidAt: '2026-07-06T18:00:00.000Z',
        },
      },
    })

    await Promise.all([screen.loadAppointment(), screen.loadSessionContext()])

    expect(screen.canRegisterPayment.value).toBe(false)
  })

  it('opens patient picker without altering current selection', async () => {
    const screen = makeViewModel()

    await Promise.all([screen.loadAppointment(), screen.loadFormOptions()])
    await screen.openPatientPicker()

    expect(screen.isPatientPickerOpen.value).toBe(true)
    expect(screen.form.patientId).toBe('patient_1')
    expect(screen.selectedPatient.value?.id).toBe('patient_1')
    expect(screen.patientSearch.value).toBe('')
  })

  it('keeps selected patient when the search has no matches', async () => {
    vi.useFakeTimers()

    const screen = makeViewModel({
      listAppointmentPatientsUseCase: {
        execute: vi.fn().mockImplementation(async (query?: { search?: string }) => {
          if (query?.search === 'Paciente distinto') return []
          return [ana, bruno]
        }),
      },
    })

    await Promise.all([screen.loadAppointment(), screen.loadFormOptions()])
    screen.patientSearch.value = 'Paciente distinto'
    await vi.advanceTimersByTimeAsync(260)

    expect(screen.form.patientId).toBe('patient_1')
    expect(screen.selectedPatient.value?.id).toBe('patient_1')
  })

  it('opens service picker without altering current selection', async () => {
    const screen = makeViewModel()

    await Promise.all([screen.loadAppointment(), screen.loadFormOptions()])
    await screen.openServicePicker()

    expect(screen.isServicePickerOpen.value).toBe(true)
    expect(screen.form.serviceId).toBe('service_1')
    expect(screen.selectedService.value?.id).toBe('service_1')
    expect(screen.serviceSearch.value).toBe('')
  })

  it('loads calendar month when editing starts', async () => {
    const getCalendarMonthUseCase = { execute: vi.fn().mockResolvedValue(calendarMonth) }
    const screen = makeViewModel({ getCalendarMonthUseCase })

    await Promise.all([screen.loadAppointment(), screen.loadFormOptions()])
    screen.startEditing()

    expect(getCalendarMonthUseCase.execute).toHaveBeenCalledWith('2026-07-07')
    expect(screen.selectedSlotStartsAt.value).toBe('2026-07-07T15:00:00.000Z')
  })
})
