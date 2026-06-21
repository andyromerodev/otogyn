import type { PatientListFilter, PatientListPageResult, PatientRepository } from '../../domain/repositories/patient-repository'

export class ListPatientsUseCase {
  constructor(private readonly patientRepository: PatientRepository) {}

  execute(input: {
    organizationId: string
    search?: string
    filter?: PatientListFilter
    page?: number
    pageSize?: number
  }): Promise<PatientListPageResult> {
    return this.patientRepository.listPage({
      organizationId: input.organizationId,
      search: input.search?.trim() ?? '',
      filter: input.filter ?? 'all',
      page: input.page ?? 1,
      pageSize: input.pageSize ?? 10,
    })
  }
}
