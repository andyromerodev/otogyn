import { computed, reactive, ref } from 'vue'
import type { MedicalService } from '../../../domain/entities/medical-service'
import type { Patient } from '../../../domain/entities/patient'
import type { AppointmentStatus } from '../../../domain/value-objects/appointment-status'
import type { AppointmentSessionContextDto } from '../../../application/dto/appointment-management'
import type { TodayAppointmentViewModel } from '../dashboard'
import {
  appointmentStatusesForUi,
  createInitialAppointmentForm,
  fromIsoToDatetimeLocalValue,
  normalizeApiError,
} from './appointment-view-model.types'
import type { AppointmentDetailViewModelDependencies } from './appointment-detail-view-model.module'

export type { AppointmentDetailViewModelDependencies } from './appointment-detail-view-model.module'

// Factory del ViewModel — equivale al constructor de AppointmentDetailViewModel : ViewModel()
export const createAppointmentDetailViewModel = (dependencies: AppointmentDetailViewModelDependencies) => {
  // Como StateFlow<TodayAppointmentViewModel?> — null hasta que loadAppointment() resuelve
  const appointment = ref<TodayAppointmentViewModel | null>(null)

  // Como StateFlow<List<Patient>> — opciones del select de pacientes para el formulario de edición
  const patients = ref<Patient[]>([])

  // Como StateFlow<List<MedicalService>> — opciones del select de servicios
  const services = ref<MedicalService[]>([])

  // Como StateFlow<AppointmentSessionContextDto?> — contexto del usuario (rol, permisos)
  const sessionContext = ref<AppointmentSessionContextDto | null>(null)

  // Como StateFlow<Boolean> — carga inicial de la cita
  const loading = ref(false)

  // Como StateFlow<Boolean> — operación de guardado de edición en curso
  const pending = ref(false)

  // Como StateFlow<Boolean> — operación de acción rápida (cambio de estado, cancelación) en curso
  const actionPending = ref(false)

  // Como StateFlow<String?> — mensaje de error, expuesto read-only a la UI
  const errorMessage = ref<string | null>(null)

  // Como StateFlow<String?> — mensaje de éxito tras una operación
  const successMessage = ref<string | null>(null)

  // Como StateFlow<Boolean> — controla si el formulario está en modo edición
  const isEditing = ref(false)

  // Como MutableStateFlow<AppointmentFormState> — estado mutable del formulario,
  // sincronizado con `appointment` al cargar y al cancelar edición
  const form = reactive(createInitialAppointmentForm())

  const syncForm = (source: TodayAppointmentViewModel) => {
    form.patientId = source.patientId
    form.serviceId = source.serviceId
    form.startAt = fromIsoToDatetimeLocalValue(source.startAt)
    form.isUrgent = source.isUrgent
    form.reason = source.reason ?? ''
    form.notes = source.notes ?? ''
  }

  const loadAppointment = async () => {
    loading.value = true
    errorMessage.value = null

    try {
      const found = await dependencies.getAppointmentDetailUseCase.execute(dependencies.appointmentId)
      appointment.value = found
      syncForm(found)
    } catch (error) {
      errorMessage.value = normalizeApiError(error, 'No se pudo cargar la cita.')
      appointment.value = null
    } finally {
      loading.value = false
    }
  }

  const loadFormOptions = async () => {
    try {
      const [loadedPatients, loadedServices] = await Promise.all([
        dependencies.listAppointmentPatientsUseCase.execute(),
        dependencies.listAppointmentServicesUseCase.execute(),
      ])

      patients.value = loadedPatients
      services.value = loadedServices
    } catch (error) {
      errorMessage.value = normalizeApiError(error, 'No se pudieron cargar los datos para editar la cita.')
    }
  }

  const loadSessionContext = async () => {
    try {
      sessionContext.value = await dependencies.getAppointmentSessionContextUseCase.execute()
    } catch (error) {
      errorMessage.value = normalizeApiError(error, 'No se pudo cargar el contexto del usuario.')
    }
  }

  // Como derivedStateOf { } — permisos calculados desde el estado de la cita y el rol del usuario
  const canEditAppointment = computed(() => {
    if (!appointment.value) return false
    return appointment.value.status !== 'completed' || sessionContext.value?.role === 'admin_doctor'
  })

  const canCancelAppointment = computed(() => {
    if (!appointment.value) return false
    return (
      appointment.value.status !== 'cancelled' &&
      (appointment.value.status !== 'completed' || sessionContext.value?.role === 'admin_doctor')
    )
  })

  const canChangeAppointmentStatus = computed(() => {
    if (!appointment.value) return false
    return (
      appointment.value.status !== 'cancelled' &&
      (appointment.value.status !== 'completed' || sessionContext.value?.role === 'admin_doctor')
    )
  })

  const startEditing = () => {
    if (!appointment.value) return
    syncForm(appointment.value)
    successMessage.value = null
    errorMessage.value = null
    isEditing.value = true
  }

  const cancelEditing = () => {
    if (appointment.value) syncForm(appointment.value)
    isEditing.value = false
  }

  const submitAppointment = async () => {
    if (!appointment.value) return

    pending.value = true
    errorMessage.value = null
    successMessage.value = null

    try {
      await dependencies.updateAppointmentUseCase.execute(appointment.value.id, {
        patientId: form.patientId,
        serviceId: form.serviceId,
        startAt: form.startAt,
        isUrgent: form.isUrgent,
        reason: form.reason.trim() || null,
        notes: form.notes.trim() || null,
      })

      await loadAppointment()
      successMessage.value = 'Cita actualizada correctamente.'
      isEditing.value = false
    } catch (error) {
      errorMessage.value = normalizeApiError(error, 'No se pudo actualizar la cita.')
    } finally {
      pending.value = false
    }
  }

  const submitStatus = async (status: Exclude<AppointmentStatus, 'cancelled'>) => {
    if (!appointment.value) return

    actionPending.value = true
    errorMessage.value = null
    successMessage.value = null

    try {
      await dependencies.changeAppointmentStatusUseCase.execute({
        appointmentId: appointment.value.id,
        status,
      })

      await loadAppointment()
      successMessage.value = 'Estado de la cita actualizado correctamente.'
    } catch (error) {
      errorMessage.value = normalizeApiError(error, 'No se pudo actualizar el estado de la cita.')
    } finally {
      actionPending.value = false
    }
  }

  const submitStatusSelection = async (statusValue: string) => {
    const status = appointmentStatusesForUi.find((item) => item.value === statusValue)?.value
    if (!status) { errorMessage.value = 'Estado de cita invalido.'; return }
    await submitStatus(status)
  }

  const submitCancellation = async () => {
    if (!appointment.value) return

    actionPending.value = true
    errorMessage.value = null
    successMessage.value = null

    try {
      await dependencies.cancelAppointmentUseCase.execute(appointment.value.id)
      await loadAppointment()
      successMessage.value = 'Cita cancelada correctamente.'
      isEditing.value = false
    } catch (error) {
      errorMessage.value = normalizeApiError(error, 'No se pudo cancelar la cita.')
    } finally {
      actionPending.value = false
    }
  }

  return {
    appointment,
    patients,
    services,
    sessionContext,
    form,
    loading,
    pending,
    actionPending,
    errorMessage,
    successMessage,
    isEditing,
    appointmentStatusesForUi,
    canEditAppointment,
    canCancelAppointment,
    canChangeAppointmentStatus,
    loadAppointment,
    loadFormOptions,
    loadSessionContext,
    startEditing,
    cancelEditing,
    submitAppointment,
    submitStatus,
    submitStatusSelection,
    submitCancellation,
  }
}
