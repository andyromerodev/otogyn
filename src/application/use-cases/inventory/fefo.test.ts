import { describe, expect, it } from 'vitest'
import { allocateFefo } from './fefo'

const lot = (id: string, quantity: number, expiresOn: string | null, receivedAt = '2026-01-01') => ({
  id,
  currentQuantity: quantity,
  expiresOn,
  receivedAt: new Date(`${receivedAt}T12:00:00Z`),
})

describe('allocateFefo', () => {
  it('distribuye entre lotes empezando por el vencimiento más próximo', () => {
    const result = allocateFefo([
      lot('late', 10, '2026-12-01'),
      lot('first', 2, '2026-08-01'),
      lot('middle', 4, '2026-10-01'),
    ], 5, '2026-07-12')

    expect(result).toEqual({
      allocations: [{ lotId: 'first', quantity: 2 }, { lotId: 'middle', quantity: 3 }],
      remaining: 0,
    })
  })

  it('excluye lotes vencidos aunque conserven stock físico', () => {
    const result = allocateFefo([lot('expired', 8, '2026-07-11'), lot('valid', 2, '2026-08-01')], 4, '2026-07-12')
    expect(result.allocations).toEqual([{ lotId: 'valid', quantity: 2 }])
    expect(result.remaining).toBe(2)
  })

  it('usa lotes sin vencimiento al final y por antigüedad', () => {
    const result = allocateFefo([lot('new', 2, null, '2026-03-01'), lot('dated', 1, '2027-01-01'), lot('old', 2, null, '2026-02-01')], 4, '2026-07-12')
    expect(result.allocations.map((allocation) => allocation.lotId)).toEqual(['dated', 'old', 'new'])
  })
})
