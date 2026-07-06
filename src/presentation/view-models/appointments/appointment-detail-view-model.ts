import { computed, reactive, ref, watch } from 'vue'
import type { MedicalService } from '../../../domain/entities/medical-service'
import type { Patient } from '../../../domain/entities/patient'
import type { AppointmentStatus } from '../../../domain/value-objects/appointment-status'
import type { AppointmentSessionContextDto, AppointmentSlotDto } from '../../../application/dto/appointment-management'
import {
  appointmentStatusesForUi,
  createInitialAppointmentForm,
  fromIsoToDatetimeLocalValue,
  normalizeApiError,
} from './appointment-view-model.types'
import type { AppointmentDetailViewModel } from './appointment-detail'
import type { AppointmentDetailViewModelDependencies } from './appointment-detail-view-model.module'

export type { AppointmentDetailViewModelDependencies } from './appointment-detail-view-model.module'

// Factory del ViewModel — equivale al constructor de AppointmentDetailViewModel : ViewModel()
export const createAppointmentDetailViewModel = (dependencies: AppointmentDetailViewModelDependencies) => {
  // Como StateFlow<TodayAppointmentViewModel?> — null hasta que loadAppointment() resuelve
  const appointment = ref<AppointmentDetailViewModel | null>(null)

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

  // Como StateFlow<Boolean> — cancelación de la cita en curso (accion especifica,
  // no comparte flag con cambio de estado para que la UI sepa cual boton mostrar como ocupado)
  const cancelingPending = ref(false)

  // Como StateFlow<Boolean> — cambio de estado de la cita en curso
  const changingStatusPending = ref(false)

  // Como StateFlow<String?> — mensaje de error, expuesto read-only a la UI
  const errorMessage = ref<string | null>(null)

  // Como StateFlow<ErrorKind?> — 'validation' (accionable) vs 'server' (tecnico)
  const errorKind = ref<'validation' | 'server' | null>(null)

  // Como StateFlow<String?> — mensaje de éxito tras una operación
  const successMessage = ref<string | null>(null)

  // Como StateFlow<Boolean> — controla si el formulario está en modo edición
  const isEditing = ref(false)

  // Como MutableStateFlow<AppointmentFormState> — estado mutable del formulario,
  // sincronizado con `appointment` al cargar y al cancelar edición
  const form = reactive(createInitialAppointmentForm())

  // Como StateFlow<List<AppointmentSlotDto>> — huecos disponibles para el dia
  // seleccionado, calculados excluyendo la propia cita (para poder reprogramar
  // dentro del mismo dia sin que su horario actual se muestre como ocupado)
  const availableSlots = ref<AppointmentSlotDto[]>([])

  // Como StateFlow<Boolean> — carga de horarios disponibles en curso
  const loadingSlots = ref(false)

  // Como MutableStateFlow<String> — fecha (YYYY-MM-DD) que se esta explorando
  // en el buscador de horarios; se sincroniza con el inicio de la cita al editar
  const slotsDate = ref('')

  const syncForm = (source: AppointmentDetailViewModel) => {
    form.patientId = source.patientId
    form.serviceId = source.serviceId
    form.agreedPrice = source.agreedPrice ?? ''
    form.startAt = fromIsoToDatetimeLocalValue(source.startAt)
    form.isUrgent = source.isUrgent
    form.reason = source.reason ?? ''
    form.notes = source.notes ?? ''
  }

  const setError = (error: unknown, fallback: string) => {
    const normalized = normalizeApiError(error, fallback)
    errorMessage.value = normalized.message
    errorKind.value = normalized.kind
  }

  const loadAppointment = async () => {
    loading.value = true
    errorMessage.value = null
    errorKind.value = null

    try {
      const found = await dependencies.getAppointmentDetailUseCase.execute(dependencies.appointmentId)
      appointment.value = found
      syncForm(found)
    } catch (error) {
      setError(error, 'No se pudo cargar la cita.')
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
      setError(error, 'No se pudieron cargar los datos para editar la cita.')
    }
  }

  const loadSessionContext = async () => {
    try {
      sessionContext.value = await dependencies.getAppointmentSessionContextUseCase.execute()
    } catch (error) {
      setError(error, 'No se pudo cargar el contexto del usuario.')
    }
  }

  // Equivale a fun loadAvailableSlots() — huecos libres para slotsDate + form.serviceId,
  // excluyendo la propia cita de los intervalos ocupados
  const loadAvailableSlots = async () => {
    if (!form.serviceId || !slotsDate.value) {
      availableSlots.value = []
      return
    }

    loadingSlots.value = true

    try {
      availableSlots.value = await dependencies.getAppointmentAvailableSlotsUseCase.execute({
        date: slotsDate.value,
        serviceId: form.serviceId,
        excludeAppointmentId: appointment.value?.id,
      })
    } catch (error) {
      setError(error, 'No se pudieron cargar los horarios disponibles.')
      availableSlots.value = []
    } finally {
      loadingSlots.value = false
    }
  }

  const selectSlot = (slot: AppointmentSlotDto) => {
    form.startAt = fromIsoToDatetimeLocalValue(slot.startsAt)
  }

  // Recarga los huecos disponibles cuando cambia el dia explorado o el
  // servicio (la duracion del servicio cambia el tamaño de los huecos)
  watch([slotsDate, () => form.serviceId], () => {
    if (isEditing.value) void loadAvailableSlots()
  })

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

  const canRegisterPayment = computed(() => {
    if (!appointment.value) return false

    return (
      sessionContext.value?.role === 'admin_doctor' &&
      appointment.value.status !== 'cancelled' &&
      !appointment.value.linkedPayment
    )
  })

  const registerPaymentHref = computed(() => {
    if (!appointment.value) return null
    return `/finances/payments/new?appointmentId=${appointment.value.id}`
  })

  const startEditing = () => {
    if (!appointment.value) return
    syncForm(appointment.value)
    successMessage.value = null
    errorMessage.value = null
    errorKind.value = null
    isEditing.value = true
    slotsDate.value = form.startAt.slice(0, 10)
    void loadAvailableSlots()
  }

  const cancelEditing = () => {
    if (appointment.value) syncForm(appointment.value)
    isEditing.value = false
  }

  const submitAppointment = async () => {
    if (!appointment.value) return

    pending.value = true
    errorMessage.value = null
    errorKind.value = null
    successMessage.value = null

    try {
      await dependencies.updateAppointmentUseCase.execute(appointment.value.id, {
        patientId: form.patientId,
        serviceId: form.serviceId,
        agreedPrice: form.agreedPrice === '' ? null : Number(form.agreedPrice),
        startAt: form.startAt,
        isUrgent: form.isUrgent,
        reason: form.reason.trim() || null,
        notes: form.notes.trim() || null,
      })

      await loadAppointment()
      successMessage.value = 'Cita actualizada correctamente.'
      isEditing.value = false
    } catch (error) {
      setError(error, 'No se pudo actualizar la cita.')
    } finally {
      pending.value = false
    }
  }

  const submitStatus = async (status: Exclude<AppointmentStatus, 'cancelled'>) => {
    if (!appointment.value) return

    changingStatusPending.value = true
    errorMessage.value = null
    errorKind.value = null
    successMessage.value = null

    try {
      await dependencies.changeAppointmentStatusUseCase.execute({
        appointmentId: appointment.value.id,
        status,
      })

      await loadAppointment()
      successMessage.value = 'Estado de la cita actualizado correctamente.'
    } catch (error) {
      setError(error, 'No se pudo actualizar el estado de la cita.')
    } finally {
      changingStatusPending.value = false
    }
  }

  const submitStatusSelection = async (statusValue: string) => {
    const status = appointmentStatusesForUi.find((item) => item.value === statusValue)?.value
    if (!status) {
      errorMessage.value = 'Estado de cita invalido.'
      errorKind.value = 'validation'
      return
    }
    await submitStatus(status)
  }

  const submitCancellation = async () => {
    if (!appointment.value) return

    cancelingPending.value = true
    errorMessage.value = null
    errorKind.value = null
    successMessage.value = null

    try {
      await dependencies.cancelAppointmentUseCase.execute(appointment.value.id)
      await loadAppointment()
      successMessage.value = 'Cita cancelada correctamente.'
      isEditing.value = false
    } catch (error) {
      setError(error, 'No se pudo cancelar la cita.')
    } finally {
      cancelingPending.value = false
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
    cancelingPending,
    changingStatusPending,
    errorMessage,
    errorKind,
    successMessage,
    isEditing,
    availableSlots,
    loadingSlots,
    slotsDate,
    appointmentStatusesForUi,
    canEditAppointment,
    canCancelAppointment,
    canChangeAppointmentStatus,
    canRegisterPayment,
    registerPaymentHref,
    loadAppointment,
    loadFormOptions,
    loadSessionContext,
    loadAvailableSlots,
    selectSlot,
    startEditing,
    cancelEditing,
    submitAppointment,
    submitStatus,
    submitStatusSelection,
    submitCancellation,
  }
}
