import { describe, expect, it } from 'vitest'
import { createInitialPaymentCreateForm, resolvePaymentPrefillFromAppointment } from './payment-create-form'

const baseAppointment = {
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
}

describe('payment-create-form', () => {
  it('prefills the payment from an appointment with service price', () => {
    const result = resolvePaymentPrefillFromAppointment(baseAppointment, '2026-07-06')

    expect(result.blocked).toBe(false)
    expect(result.missingPrice).toBe(false)
    expect(result.form).toEqual({
      patientId: 'patient_1',
      appointmentId: 'appointment_1',
      concept: 'Consulta ORL',
      amount: 650,
      method: 'efectivo',
      paidAt: '2026-07-06',
      notes: '',
    })
  })

  it('marks the amount as manual when the appointment has no configured price', () => {
    const result = resolvePaymentPrefillFromAppointment(
      { ...baseAppointment, agreedPrice: null },
      '2026-07-06',
    )

    expect(result.blocked).toBe(false)
    expect(result.missingPrice).toBe(true)
    expect(result.form.amount).toBe('')
  })

  it('blocks the form when the appointment already has a linked payment', () => {
    const result = resolvePaymentPrefillFromAppointment(
      {
        ...baseAppointment,
        linkedPayment: {
          id: 'payment_1',
          amount: 650,
          method: 'tarjeta',
          paidAt: '2026-07-06T18:00:00.000Z',
        },
      },
      '2026-07-06',
    )

    expect(result.blocked).toBe(true)
    expect(result.errorMessage).toBe('Esta cita ya tiene un pago registrado.')
    expect(result.form.appointmentId).toBe('appointment_1')
  })

  it('creates an empty payment form by default', () => {
    expect(createInitialPaymentCreateForm('2026-07-06')).toEqual({
      patientId: null,
      appointmentId: null,
      concept: '',
      amount: '',
      method: 'efectivo',
      paidAt: '2026-07-06',
      notes: '',
    })
  })
})
