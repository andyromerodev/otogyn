import { describe, expect, it } from 'vitest'
import { CreateAvailabilityUseCase } from './create-availability'
import { MockAvailabilityRepository } from '../../../infrastructure/mock/mock-availability-repository'

describe('CreateAvailabilityUseCase', () => {
  it('creates a new availability entry', async () => {
    const repository = new MockAvailabilityRepository([], [])
    const useCase = new CreateAvailabilityUseCase(repository)

    const result = await useCase.execute({
      organizationId: 'org_1',
      weekday: 1,
      startTime: '08:00',
      endTime: '17:00',
      isActive: true,
    })

    expect(result.weekday).toBe(1)
    expect(result.startTime).toBe('08:00')
    expect(result.endTime).toBe('17:00')
    expect(result.isActive).toBe(true)
  })

  it('upserts when weekday already exists for same org', async () => {
    const repository = new MockAvailabilityRepository([], [])
    const useCase = new CreateAvailabilityUseCase(repository)

    await useCase.execute({
      organizationId: 'org_1',
      weekday: 2,
      startTime: '09:00',
      endTime: '18:00',
      isActive: true,
    })

    const result = await useCase.execute({
      organizationId: 'org_1',
      weekday: 2,
      startTime: '10:00',
      endTime: '16:00',
      isActive: false,
    })

    expect(result.startTime).toBe('10:00')
    expect(result.endTime).toBe('16:00')
    expect(result.isActive).toBe(false)
  })
})

describe('ListBlockedSlotsUseCase', () => {
  it('lists blocked slots for a given day with overlap', async () => {
    const repository = new MockAvailabilityRepository([], [])
    const { ListBlockedSlotsUseCase } = await import('./list-blocked-slots')
    const useCase = new ListBlockedSlotsUseCase(repository)

    const day = new Date()
    day.setHours(0, 0, 0, 0)

    const slotStart = new Date(day)
    slotStart.setHours(13, 0, 0, 0)

    const slotEnd = new Date(day)
    slotEnd.setHours(14, 0, 0, 0)

    await repository.createBlockedSlot({
      organizationId: 'org_1',
      startsAt: slotStart,
      endsAt: slotEnd,
      reason: 'Almuerzo',
    })

    const slots = await useCase.execute({
      organizationId: 'org_1',
      day,
    })

    expect(slots).toHaveLength(1)
    expect(slots[0]?.reason).toBe('Almuerzo')
  })
})

describe('CreateBlockedSlotUseCase', () => {
  it('creates a blocked slot', async () => {
    const repository = new MockAvailabilityRepository([], [])
    const { CreateBlockedSlotUseCase } = await import('./create-blocked-slot')
    const useCase = new CreateBlockedSlotUseCase(repository)

    const result = await useCase.execute({
      organizationId: 'org_1',
      startsAt: new Date('2026-06-17T14:00:00Z'),
      endsAt: new Date('2026-06-17T15:00:00Z'),
      reason: 'Reunion',
    })

    expect(result.reason).toBe('Reunion')
  })

  it('rejects when startsAt is not before endsAt', async () => {
    const repository = new MockAvailabilityRepository([], [])
    const { CreateBlockedSlotUseCase } = await import('./create-blocked-slot')
    const useCase = new CreateBlockedSlotUseCase(repository)

    await expect(
      useCase.execute({
        organizationId: 'org_1',
        startsAt: new Date('2026-06-17T15:00:00Z'),
        endsAt: new Date('2026-06-17T14:00:00Z'),
      }),
    ).rejects.toThrow('Blocked slot start must be before end.')
  })
})

describe('DeleteBlockedSlotUseCase', () => {
  it('deletes a blocked slot', async () => {
    const repository = new MockAvailabilityRepository([], [])
    const { CreateBlockedSlotUseCase } = await import('./create-blocked-slot')
    const { DeleteBlockedSlotUseCase } = await import('./delete-blocked-slot')

    const slot = await new CreateBlockedSlotUseCase(repository).execute({
      organizationId: 'org_1',
      startsAt: new Date('2026-06-17T16:00:00Z'),
      endsAt: new Date('2026-06-17T17:00:00Z'),
    })

    await new DeleteBlockedSlotUseCase(repository).execute({ id: slot.id })

    const slots = await repository.listBlockedSlots('org_1', new Date('2026-06-17'))
    expect(slots).toHaveLength(0)
  })
})
