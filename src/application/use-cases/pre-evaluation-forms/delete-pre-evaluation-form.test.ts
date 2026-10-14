import { describe, expect, it } from 'vitest'
import { DeletePreEvaluationFormUseCase } from './delete-pre-evaluation-form'
import { MockPreEvaluationFormRepository } from '../../../infrastructure/mock/mock-pre-evaluation-form-repository'
import { BusinessRuleError } from '../../../domain/errors/business-rule-error'
import type { PreEvaluationForm } from '../../../domain/entities/pre-evaluation-form'

const ORG = 'org_1'
const OTHER_ORG = 'org_2'

function makeForm(overrides: Partial<PreEvaluationForm> = {}): PreEvaluationForm {
  const now = new Date()
  return {
    id: 'form_1',
    organizationId: ORG,
    patientId: null,
    fullName: 'Maria Torres',
    birthDate: null,
    residenceCityCountry: 'Lima, Peru',
    phone: '987654321',
    email: 'maria@example.com',
    complaintDescription: 'Molestia en garganta',
    symptomDurationText: '3 semanas',
    medicalHistory: 'Sin antecedentes',
    previousTreatmentsAndExams: null,
    attachmentKeys: [],
    understandsVirtualConditions: true,
    consentPrivacyPolicy: true,
    age: null,
    city: null,
    mainReasons: [],
    mainReasonOtherText: null,
    symptomDuration: null,
    symptomPattern: null,
    associatedSymptoms: [],
    aggravatingFactors: [],
    hasPriorRefluxDiagnosis: null,
    hasPriorTreatment: null,
    priorMedicationUsed: null,
    treatmentImprovement: null,
    priorExams: [],
    alertSigns: [],
    consultationExpectations: [],
    consentInfoTruthful: true,
    consentUnderstandsNotConsultation: true,
    status: 'pending_review',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

describe('DeletePreEvaluationFormUseCase', () => {
  it('deletes an existing pre-evaluation form belonging to the organization', async () => {
    const repository = new MockPreEvaluationFormRepository([makeForm()])
    const useCase = new DeletePreEvaluationFormUseCase(repository)

    await useCase.execute({ formId: 'form_1', organizationId: ORG })

    const remaining = await repository.findById('form_1', ORG)
    expect(remaining).toBeNull()
  })

  it('throws BusinessRuleError when form does not exist', async () => {
    const repository = new MockPreEvaluationFormRepository([])
    const useCase = new DeletePreEvaluationFormUseCase(repository)

    await expect(
      useCase.execute({ formId: 'nonexistent', organizationId: ORG }),
    ).rejects.toThrow(BusinessRuleError)
  })

  it('throws BusinessRuleError when form belongs to another organization', async () => {
    const repository = new MockPreEvaluationFormRepository([
      makeForm({ organizationId: OTHER_ORG }),
    ])
    const useCase = new DeletePreEvaluationFormUseCase(repository)

    await expect(
      useCase.execute({ formId: 'form_1', organizationId: ORG }),
    ).rejects.toThrow(BusinessRuleError)
  })
})
