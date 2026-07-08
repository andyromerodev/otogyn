import { describe, expect, it } from 'vitest'
import { resolveAppointmentPaymentBadge } from './appointment-list'

describe('appointment-list payment badge', () => {
  it('returns paid badge when the appointment has a linked payment', () => {
    expect(resolveAppointmentPaymentBadge({ paymentStatus: 'paid' })).toEqual({
      label: 'Pagada',
      tone: 'success',
    })
  })

  it('returns pending badge when the appointment has no linked payment', () => {
    expect(resolveAppointmentPaymentBadge({ paymentStatus: 'pending' })).toEqual({
      label: 'Pendiente de pago',
      tone: 'pending',
    })
  })
})
