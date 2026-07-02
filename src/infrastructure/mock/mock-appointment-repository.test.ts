import { describe, expect, it } from 'vitest'
import type { Appointment } from '../../domain/entities/appointment'
import { MockAppointmentRepository } from './mock-appointment-repository'

const makeAppointment = (overrides: Partial<Appointment> = {}): Appointment => ({
  id: 'appointment_1',
  organizationId: 'org_1',
  patientId: 'patient_andy',
  serviceId: 'service_consulta',
  professionalId: null,
  startAt: new Date('2026-07-02T14:00:00.000Z'),
  endAt: new Date('2026-07-02T14:15:00.000Z'),
  status: 'scheduled',
  isUrgent: false,
  reason: null,
  notes: null,
  createdBy: 'user_1',
  updatedBy: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  cancelledAt: null,
  ...overrides,
})

describe('MockAppointmentRepository.listPage', () => {
  it('filters by range and search, orders by newest start and paginates', async () => {
    const repository = new MockAppointmentRepository([
      makeAppointment({
        id: 'appointment_old',
        startAt: new Date('2026-07-01T14:00:00.000Z'),
        endAt: new Date('2026-07-01T14:15:00.000Z'),
        reason: 'Control de tos',
      }),
      makeAppointment({
        id: 'appointment_new',
        startAt: new Date('2026-07-03T14:00:00.000Z'),
        endAt: new Date('2026-07-03T14:15:00.000Z'),
        notes: 'Tos nocturna',
      }),
      makeAppointment({
        id: 'appointment_outside',
        startAt: new Date('2026-08-01T14:00:00.000Z'),
        endAt: new Date('2026-08-01T14:15:00.000Z'),
        reason: 'Tos',
      }),
    ])

    const result = await repository.listPage({
      organizationId: 'org_1',
      search: 'tos',
      page: 1,
      pageSize: 1,
      startAtFrom: new Date('2026-07-01T05:00:00.000Z'),
      startAtTo: new Date('2026-08-01T05:00:00.000Z'),
    })

    expect(result.items.map((item) => item.id)).toEqual(['appointment_new'])
    expect(result.total).toBe(2)
    expect(result.allTotal).toBe(3)
    expect(result.totalPages).toBe(2)
  })
})
