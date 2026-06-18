import type { AvailabilityRemoteDataSource } from './availability-remote-data-source'

export class HttpAvailabilityRemoteDataSource implements AvailabilityRemoteDataSource {
  async listWeeklyAvailability() {
     
    return $fetch('/api/availability' as any) as any
  }

  async createAvailability(input: any) {
     
    return $fetch('/api/availability' as any, { method: 'POST', body: input } as any) as any
  }

  async updateAvailability(input: any) {
     
    return $fetch(`/api/availability/${input.id}` as any, {
      method: 'PATCH',
      body: { weekday: input.weekday, startTime: input.startTime, endTime: input.endTime, isActive: input.isActive },
    } as any) as any
  }

  async toggleAvailabilityActive(id: string) {
     
    return $fetch(`/api/availability/${id}/toggle` as any, {
      method: 'POST',
      body: { isActive: true },
    } as any) as any
  }

  async createBlockedSlot(input: any) {
     
    return $fetch('/api/availability/blocked' as any, { method: 'POST', body: input } as any) as any
  }

  async deleteBlockedSlot(id: string) {
     
    await $fetch(`/api/availability/blocked/${id}` as any, { method: 'DELETE' } as any)
  }
}
