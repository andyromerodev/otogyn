import { BusinessRuleError } from '../../domain/errors/business-rule-error'
import type { Patient } from '../../domain/entities/patient'
import type { PatientRepository } from '../../domain/repositories/patient-repository'

export interface GetPatientDetailInput {
  patientId: string
  organizationId: string
}

export class GetPatientDetailUseCase {
  constructor(private readonly patientRepository: PatientRepository) {}

  async execute(input: GetPatientDetailInput): Promise<Patient> {
    const patient = await this.patientRepository.findById(input.patientId)

    if (!patient || patient.organizationId !== input.organizationId) {
      throw new BusinessRuleError('Patient not found.')
    }

    return patient
  }
}
