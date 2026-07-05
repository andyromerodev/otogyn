import type { FinanceSummaryDto } from '../../../application/dto/finance-summary'
import type { FinanceSummaryManagementRepository } from '../../../application/ports/finance-summary-management-repository'

export class HttpFinanceSummaryRemoteDataSource implements FinanceSummaryManagementRepository {
  async getSummary(): Promise<FinanceSummaryDto> {
    if (import.meta.server) {
      const requestFetch = useRequestFetch() as (
        request: string,
        options?: Record<string, unknown>,
      ) => Promise<unknown>

      return (await requestFetch('/api/finances/summary')) as FinanceSummaryDto
    }

    return $fetch<FinanceSummaryDto>('/api/finances/summary')
  }
}
