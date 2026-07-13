export interface FefoLotCandidate {
  id: string
  expiresOn: string | null
  receivedAt: Date
  currentQuantity: number
}

export interface FefoAllocation {
  lotId: string
  quantity: number
}

export const allocateFefo = (
  candidates: FefoLotCandidate[],
  requestedQuantity: number,
  today: string,
): { allocations: FefoAllocation[], remaining: number } => {
  const sorted = candidates
    .filter((lot) => lot.currentQuantity > 0 && (lot.expiresOn === null || lot.expiresOn >= today))
    .sort((a, b) => {
      const expiryOrder = (a.expiresOn ?? '9999-12-31').localeCompare(b.expiresOn ?? '9999-12-31')
      return expiryOrder || a.receivedAt.getTime() - b.receivedAt.getTime()
    })
  const allocations: FefoAllocation[] = []
  let remaining = requestedQuantity

  for (const lot of sorted) {
    if (remaining <= 0) break
    const quantity = Math.min(lot.currentQuantity, remaining)
    allocations.push({ lotId: lot.id, quantity })
    remaining = Number((remaining - quantity).toFixed(3))
  }

  return { allocations, remaining }
}
