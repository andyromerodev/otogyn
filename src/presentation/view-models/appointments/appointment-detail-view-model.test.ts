import { describe, expect, it, vi } from 'vitest'
import { createAppointmentDetailViewModel } from './appointment-detail-view-model'

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
}) =>
  createAppointmentDetailViewModel({
    appointmentId: 'appointment_1',
    getAppointmentDetailUseCase: {
      execute: vi.fn().mockResolvedValue(makeAppointment(options?.appointmentOverrides)),
    },
    listAppointmentPatientsUseCase: { execute: vi.fn().mockResolvedValue([]) },
    listAppointmentServicesUseCase: { execute: vi.fn().mockResolvedValue([]) },
    getAppointmentSessionContextUseCase: {
      execute: vi.fn().mockResolvedValue({ role: options?.role ?? 'admin_doctor' }),
    },
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
})
