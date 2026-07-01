import { describe, expect, it } from 'vitest'
import { GetAppointmentAvailableSlotsUseCase } from './get-appointment-available-slots'
import { MockAppointmentRepository } from '../../infrastructure/mock/mock-appointment-repository'
import { MockAvailabilityRepository } from '../../infrastructure/mock/mock-availability-repository'
import { MockServiceRepository } from '../../infrastructure/mock/mock-service-repository'
import type { MedicalService } from '../../domain/entities/medical-service'
import type { Appointment } from '../../domain/entities/appointment'

const ORG = 'org_1'

function makeTuesdayAt(hour: number, minute = 0): Date {
  const d = new Date()
  d.setFullYear(2025, 5, 10) // Tuesday June 10
  d.setHours(hour, minute, 0, 0)
  return d
}

const TUESDAY = makeTuesdayAt(0)

function makeService(overrides: Partial<MedicalService> = {}): MedicalService {
  return {
    id: 'svc_1',
    organizationId: ORG,
    name: 'Consulta ORL',
    description: null,
    defaultDurationMinutes: 30,
    price: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

function makeAppointment(overrides: Partial<Appointment> = {}): Appointment {
  return {
    id: 'appt_1',
    organizationId: ORG,
    patientId: 'p1',
    serviceId: 'svc_1',
    professionalId: null,
    startAt: makeTuesdayAt(10),
    endAt: makeTuesdayAt(10, 30),
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
  }
}

function makeUseCase(service: MedicalService, appointments: Appointment[] = []) {
  return new GetAppointmentAvailableSlotsUseCase(
    new MockAppointmentRepository(appointments),
    new MockAvailabilityRepository(
      [{ id: 'av1', organizationId: ORG, weekday: 2, startTime: '09:00', endTime: '17:00', isActive: true }],
      [],
    ),
    new MockServiceRepository([service]),
  )
}

describe('GetAppointmentAvailableSlotsUseCase', () => {
  it('excludes the time window occupied by other appointments', async () => {
    const useCase = makeUseCase(makeService(), [makeAppointment()])
    const slots = await useCase.execute({ organizationId: ORG, date: TUESDAY, serviceId: 'svc_1' })

    const slotMinutes = slots.map((s) => {
      const d = new Date(s.startsAt)
      return d.getHours() * 60 + d.getMinutes()
    })

    expect(slotMinutes.includes(600)).toBe(false) // 10:00 taken
  })

  it('shows the current slot as available when reprogramming excludes it', async () => {
    const appointmentBeingEdited = makeAppointment({ id: 'appt_1' })
    const useCase = makeUseCase(makeService(), [appointmentBeingEdited])

    const slots = await useCase.execute({
      organizationId: ORG,
      date: TUESDAY,
      serviceId: 'svc_1',
      excludeAppointmentId: 'appt_1',
    })

    const slotMinutes = slots.map((s) => {
      const d = new Date(s.startsAt)
      return d.getHours() * 60 + d.getMinutes()
    })

    expect(slotMinutes.includes(600)).toBe(true) // 10:00 free again, it's its own slot
  })

  it('still blocks slots taken by other appointments while excluding its own', async () => {
    const ownAppointment = makeAppointment({ id: 'appt_1', startAt: makeTuesdayAt(10), endAt: makeTuesdayAt(10, 30) })
    const otherAppointment = makeAppointment({
      id: 'appt_2',
      startAt: makeTuesdayAt(11),
      endAt: makeTuesdayAt(11, 30),
    })
    const useCase = makeUseCase(makeService(), [ownAppointment, otherAppointment])

    const slots = await useCase.execute({
      organizationId: ORG,
      date: TUESDAY,
      serviceId: 'svc_1',
      excludeAppointmentId: 'appt_1',
    })

    const slotMinutes = slots.map((s) => {
      const d = new Date(s.startsAt)
      return d.getHours() * 60 + d.getMinutes()
    })

    expect(slotMinutes.includes(600)).toBe(true) // 10:00 (own slot) is free
    expect(slotMinutes.includes(660)).toBe(false) // 11:00 (other's slot) stays blocked
  })

  it('returns empty when service is inactive', async () => {
    const useCase = makeUseCase(makeService({ isActive: false }))
    const slots = await useCase.execute({ organizationId: ORG, date: TUESDAY, serviceId: 'svc_1' })
    expect(slots).toHaveLength(0)
  })
})
