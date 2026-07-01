import { reactive, ref } from 'vue'
import type { Patient } from '../../../domain/entities/patient'
import { createInitialPatientForm } from './patient-view-model.types'
import type { PatientDetailViewModelDependencies } from './patient-detail-view-model.module'

export type { PatientDetailViewModelDependencies } from './patient-detail-view-model.module'

// Factory del ViewModel — equivale al constructor de PatientDetailViewModel : ViewModel()
export const createPatientDetailViewModel = (dependencies: PatientDetailViewModelDependencies) => {
  // Como StateFlow<Patient?> — null hasta que loadPatient() resuelve
  const patient = ref<Patient | null>(null)

  // Como StateFlow<Boolean> — carga inicial del detalle del paciente
  const loading = ref(false)

  // Como StateFlow<Boolean> — indica que una operación de guardado está en curso
  const pending = ref(false)

  // Como StateFlow<String?> — mensaje de error, expuesto read-only a la UI
  const errorMessage = ref<string | null>(null)

  // Como StateFlow<String?> — mensaje de éxito tras guardar cambios
  const successMessage = ref<string | null>(null)

  // Como StateFlow<Boolean> — controla si el formulario está en modo edición
  const isEditing = ref(false)

  // Como StateFlow<Boolean> — controla la visibilidad del dialog de confirmación
  const isConfirmOpen = ref(false)

  // Como MutableStateFlow<PatientFormState> — estado mutable del formulario,
  // sincronizado con `patient` al cargar y al cancelar edición
  const form = reactive(createInitialPatientForm())

  const syncForm = (value: Patient) => {
    form.fullName = value.fullName
    form.phone = value.phone
    form.email = value.email ?? ''
    form.birthDate = value.birthDate ?? ''
    form.documentId = value.documentId ?? ''
    form.administrativeNotes = value.administrativeNotes ?? ''
    form.isUrgent = value.isUrgent
  }

  // Equivale a fun loadPatient() — carga el detalle y sincroniza el formulario
  const loadPatient = async () => {
    loading.value = true
    errorMessage.value = null

    try {
      patient.value = await dependencies.getPatientDetailUseCase.execute({
        patientId: dependencies.patientId,
      })
      syncForm(patient.value)
    } catch (error) {
      errorMessage.value =
        error && typeof error === 'object' && 'statusMessage' in error && typeof error.statusMessage === 'string'
          ? error.statusMessage
          : 'No se pudo cargar el paciente.'
    } finally {
      loading.value = false
    }
  }

  const submitPatient = async () => {
    pending.value = true
    errorMessage.value = null
    successMessage.value = null

    try {
      patient.value = await dependencies.updatePatientUseCase.execute({
        patientId: dependencies.patientId,
        fullName: form.fullName,
        phone: form.phone,
        email: form.email.trim() || null,
        birthDate: form.birthDate || null,
        documentId: form.documentId.trim() || null,
        administrativeNotes: form.administrativeNotes.trim() || null,
        isUrgent: form.isUrgent,
      })

      if (patient.value) syncForm(patient.value)

      successMessage.value = 'Paciente actualizado correctamente.'
      isEditing.value = false
    } catch (error) {
      errorMessage.value =
        error && typeof error === 'object' && 'statusMessage' in error && typeof error.statusMessage === 'string'
          ? error.statusMessage
          : 'No se pudo actualizar el paciente.'
    } finally {
      pending.value = false
    }
  }

  // Equivale a fun onStartEditing() / onCancelEditing() — eventos de la UI
  const startEditing = () => {
    isEditing.value = true
    errorMessage.value = null
    successMessage.value = null
  }

  const cancelEditing = () => {
    if (patient.value) syncForm(patient.value)
    isEditing.value = false
    isConfirmOpen.value = false
    errorMessage.value = null
    successMessage.value = null
  }

  const requestSave = () => { isConfirmOpen.value = true }
  const confirmSave = async () => { isConfirmOpen.value = false; await submitPatient() }
  const cancelConfirm = () => { isConfirmOpen.value = false }

  return {
    patient,
    form,
    loading,
    pending,
    errorMessage,
    successMessage,
    isEditing,
    isConfirmOpen,
    loadPatient,
    startEditing,
    cancelEditing,
    requestSave,
    confirmSave,
    cancelConfirm,
  }
}
