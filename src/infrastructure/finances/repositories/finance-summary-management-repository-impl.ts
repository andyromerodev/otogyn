import type { FinanceSummaryDto } from '../../../application/dto/finance-summary'
import type { FinanceSummaryManagementRepository } from '../../../application/ports/finance-summary-management-repository'
import type { HttpFinanceSummaryRemoteDataSource } from '../remote/http-finance-summary-remote-data-source'

export class FinanceSummaryManagementRepositoryImpl implements FinanceSummaryManagementRepository {
  constructor(private readonly remoteDataSource: HttpFinanceSummaryRemoteDataSource) {}

  getSummary(): Promise<FinanceSummaryDto> {
    return this.remoteDataSource.getSummary()
  }
}
