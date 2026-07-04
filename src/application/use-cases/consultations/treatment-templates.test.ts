import { describe, expect, it } from 'vitest'
import type { TreatmentTemplate, CreateTreatmentTemplateInput } from '../../dto/consultation'
import type { TreatmentTemplateRepository } from '../../ports/treatment-template-repository'
import { ListTreatmentTemplatesUseCase } from './list-treatment-templates'
import { CreateTreatmentTemplateUseCase } from './create-treatment-template'
import { DeleteTreatmentTemplateUseCase } from './delete-treatment-template'

// ——— Mock in-memory repository ———

class MockTreatmentTemplateRepository implements TreatmentTemplateRepository {
  private readonly store: TreatmentTemplate[]

  constructor(initial: TreatmentTemplate[] = []) {
    this.store = [...initial]
  }

  async list(organizationId: string, diagnosisCode?: string): Promise<TreatmentTemplate[]> {
    return this.store
      .filter((t) => t.organizationId === organizationId)
      .filter((t) => (diagnosisCode ? t.diagnosisCode === diagnosisCode : true))
  }

  async create(input: CreateTreatmentTemplateInput): Promise<TreatmentTemplate> {
    const template: TreatmentTemplate = {
      id: `tmpl_${Date.now()}`,
      organizationId: input.organizationId,
      name: input.name,
      diagnosisCode: input.diagnosisCode ?? null,
      diagnosisLabel: input.diagnosisLabel ?? null,
      treatmentPlan: input.treatmentPlan,
      medications: input.medications,
      auxiliaryExams: input.auxiliaryExams,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.store.push(template)
    return template
  }

  async delete(id: string, organizationId: string): Promise<boolean> {
    const index = this.store.findIndex((t) => t.id === id && t.organizationId === organizationId)
    if (index === -1) return false
    this.store.splice(index, 1)
    return true
  }
}

// ——— Helpers ———

const makeTemplate = (overrides: Partial<TreatmentTemplate> = {}): TreatmentTemplate => ({
  id: 'tmpl_1',
  organizationId: 'org_1',
  name: 'Otitis media estándar',
  diagnosisCode: 'AB0Z',
  diagnosisLabel: 'Otitis media, sin especificación',
  treatmentPlan: 'Reposo y analgesia.',
  medications: [{ name: 'Ibuprofeno', dose: '400mg', route: 'oral', frequency: 'c/8h', duration: '5d', additionalInfo: null, isUsualMedication: false }],
  auxiliaryExams: ['Audiometría'],
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

const MAKE_INPUT = (overrides: Partial<CreateTreatmentTemplateInput> = {}): CreateTreatmentTemplateInput => ({
  organizationId: 'org_1',
  name: 'Faringitis aguda',
  diagnosisCode: 'CA02',
  diagnosisLabel: 'Faringitis aguda',
  treatmentPlan: 'Reposo y líquidos.',
  medications: [],
  auxiliaryExams: [],
  ...overrides,
})

// ——— ListTreatmentTemplatesUseCase ———

describe('ListTreatmentTemplatesUseCase', () => {
  it('returns all templates for the organization', async () => {
    const repo = new MockTreatmentTemplateRepository([
      makeTemplate({ id: 'tmpl_1', organizationId: 'org_1' }),
      makeTemplate({ id: 'tmpl_2', organizationId: 'org_1' }),
    ])
    const useCase = new ListTreatmentTemplatesUseCase(repo)

    const result = await useCase.execute({ organizationId: 'org_1' })

    expect(result).toHaveLength(2)
  })

  it('does not return templates from other organizations', async () => {
    const repo = new MockTreatmentTemplateRepository([
      makeTemplate({ id: 'tmpl_1', organizationId: 'org_other' }),
    ])
    const useCase = new ListTreatmentTemplatesUseCase(repo)

    const result = await useCase.execute({ organizationId: 'org_1' })

    expect(result).toHaveLength(0)
  })

  it('filters by diagnosisCode when provided', async () => {
    const repo = new MockTreatmentTemplateRepository([
      makeTemplate({ id: 'tmpl_1', organizationId: 'org_1', diagnosisCode: 'AB0Z' }),
      makeTemplate({ id: 'tmpl_2', organizationId: 'org_1', diagnosisCode: 'CA02' }),
    ])
    const useCase = new ListTreatmentTemplatesUseCase(repo)

    const result = await useCase.execute({ organizationId: 'org_1', diagnosisCode: 'AB0Z' })

    expect(result).toHaveLength(1)
    expect(result[0]?.diagnosisCode).toBe('AB0Z')
  })

  it('returns empty list when organization has no templates', async () => {
    const repo = new MockTreatmentTemplateRepository([])
    const useCase = new ListTreatmentTemplatesUseCase(repo)

    const result = await useCase.execute({ organizationId: 'org_1' })

    expect(result).toHaveLength(0)
  })
})

// ——— CreateTreatmentTemplateUseCase ———

describe('CreateTreatmentTemplateUseCase', () => {
  it('creates and returns a new template', async () => {
    const repo = new MockTreatmentTemplateRepository()
    const useCase = new CreateTreatmentTemplateUseCase(repo)

    const result = await useCase.execute(MAKE_INPUT())

    expect(result.name).toBe('Faringitis aguda')
    expect(result.organizationId).toBe('org_1')
    expect(result.id).toBeTruthy()
  })

  it('stores the template so it appears in subsequent list calls', async () => {
    const repo = new MockTreatmentTemplateRepository()
    const createUseCase = new CreateTreatmentTemplateUseCase(repo)
    const listUseCase = new ListTreatmentTemplatesUseCase(repo)

    await createUseCase.execute(MAKE_INPUT({ name: 'Plan A' }))
    await createUseCase.execute(MAKE_INPUT({ name: 'Plan B' }))

    const templates = await listUseCase.execute({ organizationId: 'org_1' })
    expect(templates).toHaveLength(2)
    expect(templates.map((t) => t.name)).toContain('Plan A')
    expect(templates.map((t) => t.name)).toContain('Plan B')
  })

  it('persists optional fields when provided', async () => {
    const repo = new MockTreatmentTemplateRepository()
    const useCase = new CreateTreatmentTemplateUseCase(repo)

    const result = await useCase.execute(MAKE_INPUT({
      diagnosisCode: 'AB0Z',
      medications: [{ name: 'Amoxicilina', dose: '500mg', route: 'oral', frequency: 'c/8h', duration: '7d', additionalInfo: null, isUsualMedication: false }],
      auxiliaryExams: ['Hemograma'],
    }))

    expect(result.diagnosisCode).toBe('AB0Z')
    expect(result.medications).toHaveLength(1)
    expect(result.auxiliaryExams).toContain('Hemograma')
  })
})

// ——— DeleteTreatmentTemplateUseCase ———

describe('DeleteTreatmentTemplateUseCase', () => {
  it('deletes an existing template', async () => {
    const repo = new MockTreatmentTemplateRepository([makeTemplate({ id: 'tmpl_1', organizationId: 'org_1' })])
    const deleteUseCase = new DeleteTreatmentTemplateUseCase(repo)
    const listUseCase = new ListTreatmentTemplatesUseCase(repo)

    await deleteUseCase.execute({ id: 'tmpl_1', organizationId: 'org_1' })

    const remaining = await listUseCase.execute({ organizationId: 'org_1' })
    expect(remaining).toHaveLength(0)
  })

  it('throws BusinessRuleError when template does not exist', async () => {
    const repo = new MockTreatmentTemplateRepository([])
    const useCase = new DeleteTreatmentTemplateUseCase(repo)

    await expect(useCase.execute({ id: 'tmpl_missing', organizationId: 'org_1' }))
      .rejects.toThrow('Plantilla no encontrada.')
  })

  it('throws BusinessRuleError when template belongs to another organization', async () => {
    const repo = new MockTreatmentTemplateRepository([
      makeTemplate({ id: 'tmpl_1', organizationId: 'org_other' }),
    ])
    const useCase = new DeleteTreatmentTemplateUseCase(repo)

    await expect(useCase.execute({ id: 'tmpl_1', organizationId: 'org_1' }))
      .rejects.toThrow('Plantilla no encontrada.')
  })
})
