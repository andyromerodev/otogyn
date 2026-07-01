import { ref, watch } from 'vue'
import type { Patient } from '../../../domain/entities/patient'
import type { PatientListItem } from '../../../domain/repositories/patient-repository'
import type { PreEvaluationForm } from '../../../domain/entities/pre-evaluation-form'
import type { PreEvaluationFormDetailViewModelDependencies } from './pre-evaluation-form-detail-view-model.module'

export type { PreEvaluationFormDetailViewModelDependencies } from './pre-evaluation-form-detail-view-model.module'

const resolveErrorMessage = (error: unknown, fallback: string) =>
  error && typeof error === 'object' && 'statusMessage' in error && typeof error.statusMessage === 'string'
    ? error.statusMessage
    : fallback

export const createPreEvaluationFormDetailViewModel = (
  dependencies: PreEvaluationFormDetailViewModelDependencies,
) => {
  const form = ref<PreEvaluationForm | null>(null)
  const loading = ref(false)
  const errorMessage = ref<string | null>(null)

  const linkedPatient = ref<Patient | null>(null)
  const linkedPatientLoading = ref(false)

  const actionPending = ref(false)
  const actionErrorMessage = ref<string | null>(null)

  const isPickerOpen = ref(false)
  const patientSearchTerm = ref('')
  const patientSearchResults = ref<PatientListItem[]>([])
  const patientSearchLoading = ref(false)

  const isConfirmCreateOpen = ref(false)

  let searchTimer: ReturnType<typeof setTimeout> | null = null

  const clearSearchTimer = () => {
    if (!searchTimer) return
    clearTimeout(searchTimer)
    searchTimer = null
  }

  const loadLinkedPatient = async (patientId: string) => {
    linkedPatientLoading.value = true
    try {
      linkedPatient.value = await dependencies.getPatientDetailUseCase.execute({ patientId })
    } catch {
      linkedPatient.value = null
    } finally {
      linkedPatientLoading.value = false
    }
  }

  const loadForm = async () => {
    loading.value = true
    errorMessage.value = null

    try {
      form.value = await dependencies.getPreEvaluationFormDetailUseCase.execute({
        formId: dependencies.formId,
      })

      if (form.value.patientId) {
        await loadLinkedPatient(form.value.patientId)
      }
    } catch (error) {
      errorMessage.value = resolveErrorMessage(error, 'No se pudo cargar el formulario.')
    } finally {
      loading.value = false
    }
  }

  const searchPatients = async () => {
    patientSearchLoading.value = true
    try {
      const result = await dependencies.listPatientsUseCase.execute({
        search: patientSearchTerm.value,
        filter: 'all',
        page: 1,
        pageSize: 10,
      })
      patientSearchResults.value = result.items
    } catch {
      patientSearchResults.value = []
    } finally {
      patientSearchLoading.value = false
    }
  }

  watch(patientSearchTerm, () => {
    clearSearchTimer()
    searchTimer = setTimeout(() => {
      void searchPatients()
      searchTimer = null
    }, 250)
  })

  const openPicker = () => {
    isPickerOpen.value = true
    actionErrorMessage.value = null
    patientSearchTerm.value = ''
    patientSearchResults.value = []
  }

  const closePicker = () => {
    isPickerOpen.value = false
  }

  const linkToPatient = async (patientId: string) => {
    actionPending.value = true
    actionErrorMessage.value = null

    try {
      form.value = await dependencies.linkPreEvaluationFormToPatientUseCase.execute({
        formId: dependencies.formId,
        patientId,
      })
      isPickerOpen.value = false
      await loadLinkedPatient(patientId)
    } catch (error) {
      actionErrorMessage.value = resolveErrorMessage(error, 'No se pudo vincular el paciente.')
    } finally {
      actionPending.value = false
    }
  }

  const requestCreatePatient = () => {
    actionErrorMessage.value = null
    isConfirmCreateOpen.value = true
  }

  const cancelCreatePatient = () => {
    isConfirmCreateOpen.value = false
  }

  const confirmCreatePatient = async () => {
    isConfirmCreateOpen.value = false
    actionPending.value = true
    actionErrorMessage.value = null

    try {
      const result = await dependencies.createPatientFromPreEvaluationFormUseCase.execute({
        formId: dependencies.formId,
      })
      form.value = result.form
      linkedPatient.value = result.patient
    } catch (error) {
      actionErrorMessage.value = resolveErrorMessage(error, 'No se pudo crear el paciente.')
    } finally {
      actionPending.value = false
    }
  }

  return {
    form,
    loading,
    errorMessage,
    linkedPatient,
    linkedPatientLoading,
    actionPending,
    actionErrorMessage,
    isPickerOpen,
    patientSearchTerm,
    patientSearchResults,
    patientSearchLoading,
    isConfirmCreateOpen,
    loadForm,
    openPicker,
    closePicker,
    linkToPatient,
    requestCreatePatient,
    cancelCreatePatient,
    confirmCreatePatient,
  }
}
