import { describe, expect, it, vi } from 'vitest'
import { BusinessRuleError } from '../../domain/errors/business-rule-error'
import type { Payment } from '../../domain/entities/payment'
import { MockAppointmentRepository } from '../../infrastructure/mock/mock-appointment-repository'
import { MockPatientRepository } from '../../infrastructure/mock/mock-patient-repository'
import { MockServiceRepository } from '../../infrastructure/mock/mock-service-repository'
import { GetAppointmentDetailUseCase } from './get-appointment-detail'

const now = new Date('2026-07-06T15:00:00.000Z')

const appointment = {
  id: 'appointment_1',
  organizationId: 'org_1',
  patientId: 'patient_1',
  serviceId: 'service_1',
  agreedPrice: null,
  professionalId: null,
  startAt: new Date('2026-07-07T15:00:00.000Z'),
  endAt: new Date('2026-07-07T15:30:00.000Z'),
  status: 'scheduled' as const,
  isUrgent: false,
  reason: 'Control',
  notes: 'Seguimiento',
  createdBy: 'user_1',
  updatedBy: null,
  createdAt: now,
  updatedAt: now,
  cancelledAt: null,
}

const patient = {
  id: 'patient_1',
  organizationId: 'org_1',
  fullName: 'Ana Torres',
  phone: '555-0101',
  email: 'ana@otogyn.test',
  birthDate: null,
  documentId: null,
  administrativeNotes: null,
  isUrgent: false,
  createdAt: now,
  updatedAt: now,
  deletedAt: null,
}

const service = {
  id: 'service_1',
  organizationId: 'org_1',
  name: 'Consulta ORL',
  description: null,
  defaultDurationMinutes: 30,
  price: 650,
  isActive: true,
  createdAt: now,
  updatedAt: now,
}

const linkedPayment: Payment = {
  id: 'payment_1',
  organizationId: 'org_1',
  patientId: 'patient_1',
  appointmentId: 'appointment_1',
  consultationId: null,
  amount: 650,
  method: 'tarjeta',
  concept: 'Consulta ORL',
  paidAt: new Date('2026-07-06T18:00:00.000Z'),
  notes: null,
  createdBy: 'user_1',
  createdAt: now,
  updatedAt: now,
}

const makePaymentRepository = (payment: Payment | null = linkedPayment) => ({
  findByAppointmentId: vi.fn().mockResolvedValue(payment),
}) as const

describe('GetAppointmentDetailUseCase', () => {
  it('returns service price and linked payment for the appointment detail', async () => {
    const paymentRepository = makePaymentRepository()
    const useCase = new GetAppointmentDetailUseCase(
      new MockAppointmentRepository([appointment]),
      new MockPatientRepository([patient]),
      new MockServiceRepository([service]),
      paymentRepository,
    )

    const result = await useCase.execute({
      appointmentId: appointment.id,
      organizationId: 'org_1',
    })

    expect(result.patientName).toBe('Ana Torres')
    expect(result.serviceName).toBe('Consulta ORL')
    expect(result.agreedPrice).toBe(650)
    expect(result.linkedPayment).toEqual({
      id: 'payment_1',
      amount: 650,
      method: 'tarjeta',
      paidAt: linkedPayment.paidAt,
    })
    expect(paymentRepository.findByAppointmentId).toHaveBeenCalledWith({
      organizationId: 'org_1',
      appointmentId: 'appointment_1',
    })
  })

  it('rejects when the appointment belongs to another organization', async () => {
    const useCase = new GetAppointmentDetailUseCase(
      new MockAppointmentRepository([appointment]),
      new MockPatientRepository([patient]),
      new MockServiceRepository([service]),
      makePaymentRepository(null),
    )

    await expect(
      useCase.execute({ appointmentId: appointment.id, organizationId: 'org_2' }),
    ).rejects.toThrow(BusinessRuleError)
  })
})
