import { describe, expect, it } from 'vitest'
import { CreatePatientFromPreEvaluationFormUseCase } from './create-patient-from-pre-evaluation-form'
import { MockPatientRepository } from '../../../infrastructure/mock/mock-patient-repository'
import { MockPreEvaluationFormRepository } from '../../../infrastructure/mock/mock-pre-evaluation-form-repository'
import type { PreEvaluationForm } from '../../../domain/entities/pre-evaluation-form'

const ORG = 'org_1'

function makeForm(overrides: Partial<PreEvaluationForm> = {}): PreEvaluationForm {
  const now = new Date()
  return {
    id: 'form_1',
    organizationId: ORG,
    patientId: null,
    fullName: 'Maria Torres',
    age: null,
    city: null,
    birthDate: '1992-04-15',
    residenceCityCountry: 'Lima, Peru',
    phone: '987654321',
    email: 'maria@example.com',
    complaintDescription: 'Molestias en la garganta',
    symptomDurationText: '3 semanas',
    medicalHistory: 'Rinitis alergica',
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

describe('CreatePatientFromPreEvaluationFormUseCase', () => {
  it('creates a patient from the form contact info and links it back with birthDate and notes', async () => {
    const formRepo = new MockPreEvaluationFormRepository([makeForm()])
    const patientRepo = new MockPatientRepository([])
    const useCase = new CreatePatientFromPreEvaluationFormUseCase(formRepo, patientRepo)

    const result = await useCase.execute({ formId: 'form_1', organizationId: ORG })

    expect(result.patient.fullName).toBe('Maria Torres')
    expect(result.patient.phone).toBe('987654321')
    expect(result.patient.email).toBe('maria@example.com')
    expect(result.patient.birthDate).toBe('1992-04-15')
    expect(result.patient.administrativeNotes).toBe('Antecedentes del formulario: Rinitis alergica')
    expect(result.form.patientId).toBe(result.patient.id)
    expect(result.form.status).toBe('reviewed')
  })

  it('rejects when the form does not exist', async () => {
    const formRepo = new MockPreEvaluationFormRepository([])
    const patientRepo = new MockPatientRepository([])
    const useCase = new CreatePatientFromPreEvaluationFormUseCase(formRepo, patientRepo)

    await expect(useCase.execute({ formId: 'missing', organizationId: ORG })).rejects.toThrow(
      'Pre-evaluation form not found.',
    )
  })
})
