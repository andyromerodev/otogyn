import { describe, expect, it } from 'vitest'
import { GetPublicSlotsUseCase } from './get-public-slots'
import { MockAppointmentRepository } from '../../../infrastructure/mock/mock-appointment-repository'
import { MockAvailabilityRepository } from '../../../infrastructure/mock/mock-availability-repository'
import { MockServiceRepository } from '../../../infrastructure/mock/mock-service-repository'
import type { MedicalService } from '../../../domain/entities/medical-service'
import type { Appointment } from '../../../domain/entities/appointment'

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

function makeUseCase(service: MedicalService, appointments: Appointment[] = []) {
  return new GetPublicSlotsUseCase(
    new MockAppointmentRepository(appointments),
    new MockAvailabilityRepository(
      [{ id: 'av1', organizationId: ORG, weekday: 2, startTime: '09:00', endTime: '17:00', isActive: true }],
      [],
    ),
    new MockServiceRepository([service]),
  )
}

describe('GetPublicSlotsUseCase', () => {
  it('returns 30-min slots across a 09:00-17:00 window', async () => {
    const useCase = makeUseCase(makeService())
    const slots = await useCase.execute({ organizationId: ORG, date: TUESDAY, serviceId: 'svc_1' })

    expect(slots.length).toBe(16) // 8h * 2 slots/h
    expect(new Date(slots[0]!.startsAt).getHours()).toBe(9)
    expect(new Date(slots[0]!.endsAt).getHours()).toBe(9)
    expect(new Date(slots[0]!.endsAt).getMinutes()).toBe(30)
    expect(new Date(slots[slots.length - 1]!.endsAt).getHours()).toBe(17)
    expect(slots.every((s) => s.durationMinutes === 30)).toBe(true)
    // each slot ends exactly where the next begins
    for (let i = 0; i < slots.length - 1; i++) {
      expect(slots[i]!.endsAt).toBe(slots[i + 1]!.startsAt)
    }
  })

  it('returns empty when service is inactive', async () => {
    const useCase = makeUseCase(makeService({ isActive: false }))
    const slots = await useCase.execute({ organizationId: ORG, date: TUESDAY, serviceId: 'svc_1' })
    expect(slots).toHaveLength(0)
  })

  it('returns empty when no availability exists for that weekday', async () => {
    const service = makeService()
    const useCase = new GetPublicSlotsUseCase(
      new MockAppointmentRepository([]),
      new MockAvailabilityRepository([], []),
      new MockServiceRepository([service]),
    )
    const slots = await useCase.execute({ organizationId: ORG, date: TUESDAY, serviceId: 'svc_1' })
    expect(slots).toHaveLength(0)
  })

  it('excludes the time window occupied by an existing appointment', async () => {
    const appt: Appointment = {
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
    }
    const useCase = makeUseCase(makeService(), [appt])
    const slots = await useCase.execute({ organizationId: ORG, date: TUESDAY, serviceId: 'svc_1' })

    const slotLocalHours = slots.map((s) => {
      const d = new Date(s.startsAt)
      return d.getHours() * 60 + d.getMinutes()
    })
    // 10:00 slot (600 minutes) should not appear
    expect(slotLocalHours.includes(600)).toBe(false)
    // 09:30 (570) and 10:30 (630) should be present
    expect(slotLocalHours.includes(570)).toBe(true)
    expect(slotLocalHours.includes(630)).toBe(true)
  })

  it('returns no slots when service duration exceeds available window', async () => {
    const service = makeService({ defaultDurationMinutes: 120 })
    const useCase = new GetPublicSlotsUseCase(
      new MockAppointmentRepository([]),
      new MockAvailabilityRepository(
        [{ id: 'av1', organizationId: ORG, weekday: 2, startTime: '09:00', endTime: '10:00', isActive: true }],
        [],
      ),
      new MockServiceRepository([service]),
    )
    const slots = await useCase.execute({ organizationId: ORG, date: TUESDAY, serviceId: 'svc_1' })
    expect(slots).toHaveLength(0)
  })
})
