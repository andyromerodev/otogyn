import { describe, expect, it } from 'vitest'
import { GetCalendarDayUseCase } from './get-calendar-day'
import { MockAppointmentRepository } from '../../../infrastructure/mock/mock-appointment-repository'
import { MockAvailabilityRepository } from '../../../infrastructure/mock/mock-availability-repository'
import type { Patient } from '../../../domain/entities/patient'
import type { MedicalService } from '../../../domain/entities/medical-service'
import type { PatientRepository } from '../../../domain/repositories/patient-repository'
import type { ServiceRepository } from '../../../domain/repositories/service-repository'

const ORG = 'org_1'

function makeDate(hour: number, minute = 0): Date {
  const d = new Date()
  d.setFullYear(2025, 5, 10) // June 10, 2025 (Tuesday)
  d.setHours(hour, minute, 0, 0)
  return d
}

const stubPatientRepo: PatientRepository = {
  listByOrganization: async () => [
    { id: 'p1', fullName: 'Ana López', organizationId: ORG } as Patient,
  ],
  findById: async () => null,
  save: async (p) => p,
}

const stubServiceRepo: ServiceRepository = {
  listByOrganization: async () => [
    { id: 's1', name: 'Consulta general', organizationId: ORG } as MedicalService,
  ],
  findById: async () => null,
  save: async (s) => s,
}

describe('GetCalendarDayUseCase', () => {
  const tuesday = (() => { const d = new Date(); d.setFullYear(2025, 5, 10); d.setHours(12, 0, 0, 0); return d })() // June 10, 2025 = Tuesday

  it('returns a workday with active availability windows', async () => {
    const availRepo = new MockAvailabilityRepository(
      [{ id: 'av1', organizationId: ORG, weekday: 2, startTime: '09:00', endTime: '18:00', isActive: true }],
      [],
    )
    const apptRepo = new MockAppointmentRepository([])
    const useCase = new GetCalendarDayUseCase(apptRepo, availRepo, stubPatientRepo, stubServiceRepo)

    const result = await useCase.execute({ organizationId: ORG, date: tuesday })

    expect(result.isWorkday).toBe(true)
    expect(result.availabilityWindows).toHaveLength(1)
    expect(result.availabilityWindows[0]!.startTime).toBe('09:00')
  })

  it('returns no free slots when entire window is blocked', async () => {
    const availRepo = new MockAvailabilityRepository(
      [{ id: 'av1', organizationId: ORG, weekday: 2, startTime: '09:00', endTime: '10:00', isActive: true }],
      [
        {
          id: 'bl1',
          organizationId: ORG,
          startsAt: makeDate(9),
          endsAt: makeDate(10),
          reason: 'Reunion',
        },
      ],
    )
    const apptRepo = new MockAppointmentRepository([])
    const useCase = new GetCalendarDayUseCase(apptRepo, availRepo, stubPatientRepo, stubServiceRepo)

    const result = await useCase.execute({ organizationId: ORG, date: tuesday })

    expect(result.freeSlots).toHaveLength(0)
  })

  it('computes free slots correctly around an appointment', async () => {
    const availRepo = new MockAvailabilityRepository(
      [{ id: 'av1', organizationId: ORG, weekday: 2, startTime: '09:00', endTime: '11:00', isActive: true }],
      [],
    )
    const apptRepo = new MockAppointmentRepository([
      {
        id: 'a1',
        organizationId: ORG,
        patientId: 'p1',
        serviceId: 's1',
        professionalId: null,
        startAt: makeDate(10),
        endAt: makeDate(10, 30),
        status: 'confirmed',
        isUrgent: false,
        reason: null,
        notes: null,
        createdBy: 'u1',
        updatedBy: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        cancelledAt: null,
      },
    ])
    const useCase = new GetCalendarDayUseCase(apptRepo, availRepo, stubPatientRepo, stubServiceRepo)

    const result = await useCase.execute({ organizationId: ORG, date: tuesday })

    expect(result.freeSlots.length).toBeGreaterThan(0)
    expect(result.appointments).toHaveLength(1)
    expect(result.appointments[0]!.patientName).toBe('Ana López')
  })

  it('marks sunday as non-workday when no availability set', async () => {
    const sunday = (() => { const d = new Date(); d.setFullYear(2025, 5, 8); d.setHours(12, 0, 0, 0); return d })() // June 8, 2025 = Sunday
    const availRepo = new MockAvailabilityRepository(
      [{ id: 'av1', organizationId: ORG, weekday: 2, startTime: '09:00', endTime: '18:00', isActive: true }],
      [],
    )
    const apptRepo = new MockAppointmentRepository([])
    const useCase = new GetCalendarDayUseCase(apptRepo, availRepo, stubPatientRepo, stubServiceRepo)

    const result = await useCase.execute({ organizationId: ORG, date: sunday })

    expect(result.isWorkday).toBe(false)
    expect(result.freeSlots).toHaveLength(0)
  })
})
