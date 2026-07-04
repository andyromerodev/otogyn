import type { TreatmentTemplate } from '~~/src/application/dto/consultation'
import type { ConsultationMedication } from '~~/src/infrastructure/database/schema'

export interface SaveTemplateInput {
  name: string
  diagnosisCode?: string | null
  diagnosisLabel?: string | null
  treatmentPlan: string
  medications: ConsultationMedication[]
  auxiliaryExams: string[]
}

export const useTreatmentTemplates = () => {
  const templates = ref<TreatmentTemplate[]>([])
  const loadingTemplates = ref(false)
  const savingTemplate = ref(false)
  const saveError = ref<string | null>(null)

  const load = async () => {
    loadingTemplates.value = true
    try {
      templates.value = await $fetch<TreatmentTemplate[]>('/api/consultations/templates')
    } catch {
      // offline — graceful degradation
    } finally {
      loadingTemplates.value = false
    }
  }

  const save = async (input: SaveTemplateInput): Promise<TreatmentTemplate | null> => {
    savingTemplate.value = true
    saveError.value = null
    try {
      const created = await $fetch<TreatmentTemplate>('/api/consultations/templates', {
        method: 'POST',
        body: input,
      })
      templates.value.unshift(created)
      return created
    } catch {
      saveError.value = 'No se pudo guardar la plantilla. Intenta de nuevo.'
      return null
    } finally {
      savingTemplate.value = false
    }
  }

  const remove = async (id: string) => {
    try {
      await $fetch(`/api/consultations/templates/${id}`, { method: 'DELETE' })
      templates.value = templates.value.filter((t) => t.id !== id)
    } catch {
      // silent
    }
  }

  return { templates, loadingTemplates, savingTemplate, saveError, load, save, remove }
}
