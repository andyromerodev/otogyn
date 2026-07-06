import type { PaymentMethod } from '../../../domain/entities/payment'
import type { AppointmentDetailViewModel } from '../appointments/appointment-detail'

export interface PaymentCreateFormState {
  patientId: string | null
  appointmentId: string | null
  concept: string
  amount: string | number
  method: PaymentMethod
  paidAt: string
  notes: string
}

export interface AppointmentPaymentPrefillResult {
  blocked: boolean
  errorMessage: string | null
  missingPrice: boolean
  form: PaymentCreateFormState
}

export const createInitialPaymentCreateForm = (
  paidAt: string = new Date().toISOString().slice(0, 10),
): PaymentCreateFormState => ({
  patientId: null,
  appointmentId: null,
  concept: '',
  amount: '',
  method: 'efectivo',
  paidAt,
  notes: '',
})

export const resolvePaymentPrefillFromAppointment = (
  appointment: AppointmentDetailViewModel,
  paidAt: string = new Date().toISOString().slice(0, 10),
): AppointmentPaymentPrefillResult => {
  const form: PaymentCreateFormState = {
    patientId: appointment.patientId,
    appointmentId: appointment.id,
    concept: appointment.serviceName,
    amount: appointment.agreedPrice ?? '',
    method: 'efectivo',
    paidAt,
    notes: '',
  }

  if (appointment.linkedPayment) {
    return {
      blocked: true,
      errorMessage: 'Esta cita ya tiene un pago registrado.',
      missingPrice: false,
      form,
    }
  }

  return {
    blocked: false,
    errorMessage: null,
    missingPrice: appointment.agreedPrice === null,
    form,
  }
}
