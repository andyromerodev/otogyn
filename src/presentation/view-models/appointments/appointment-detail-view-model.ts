import { computed, reactive, ref, watch } from 'vue'
import type { CalendarMonthDto } from '../../../application/dto/calendar'
import type { MedicalService } from '../../../domain/entities/medical-service'
import type { Patient } from '../../../domain/entities/patient'
import type { AppointmentStatus } from '../../../domain/value-objects/appointment-status'
import type { AppointmentSessionContextDto, AppointmentSlotDto } from '../../../application/dto/appointment-management'
import { formatLocalDate, parseLocalDate, toAppTimeLabel } from '../../../application/utils/date/local-date'
import {
  appointmentStatusesForUi,
  createInitialAppointmentForm,
  fromIsoToDatetimeLocalValue,
  normalizeApiError,
} from './appointment-view-model.types'
import type { AppointmentDetailViewModel } from './appointment-detail'
import type { AppointmentDetailViewModelDependencies } from './appointment-detail-view-model.module'

export type { AppointmentDetailViewModelDependencies } from './appointment-detail-view-model.module'

const shortWeekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

const shiftMonth = (dateString: string, offset: number) => {
  const date = parseLocalDate(dateString)
  return formatLocalDate(new Date(date.getFullYear(), date.getMonth() + offset, 1))
}

const dateFieldFormatter = new Intl.DateTimeFormat('es-PE', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

// Factory del ViewModel — equivale al constructor de AppointmentDetailViewModel : ViewModel()
export const createAppointmentDetailViewModel = (dependencies: AppointmentDetailViewModelDependencies) => {
  // Como StateFlow<TodayAppointmentViewModel?> — null hasta que loadAppointment() resuelve
  const appointment = ref<AppointmentDetailViewModel | null>(null)

  // Como StateFlow<List<Patient>> — resultados de búsqueda del picker de pacientes
  const patients = ref<Patient[]>([])
  const selectedPatient = ref<Patient | null>(null)
  const patientSearch = ref('')
  const patientsLoading = ref(false)
  const isPatientPickerOpen = ref(false)

  // Como StateFlow<List<MedicalService>> — resultados de búsqueda del picker de servicios
  const services = ref<MedicalService[]>([])
  const selectedService = ref<MedicalService | null>(null)
  const serviceSearch = ref('')
  const servicesLoading = ref(false)
  const isServicePickerOpen = ref(false)

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
  const calendarMonth = ref<CalendarMonthDto | null>(null)
  const calendarLoading = ref(false)
  const currentMonthReference = ref('')
  const selectedSlotStartsAt = ref<string | null>(null)
  let patientSearchTimer: ReturnType<typeof setTimeout> | null = null
  let serviceSearchTimer: ReturnType<typeof setTimeout> | null = null
  const servicePriceById = reactive<Record<string, number | null>>({})

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
    selectedSlotStartsAt.value = source.startAt
    selectedPatient.value = null
    selectedService.value = null
    patientSearch.value = ''
    serviceSearch.value = ''
  }

  const clearPatientSearchTimer = () => {
    if (!patientSearchTimer) return
    clearTimeout(patientSearchTimer)
    patientSearchTimer = null
  }

  const clearServiceSearchTimer = () => {
    if (!serviceSearchTimer) return
    clearTimeout(serviceSearchTimer)
    serviceSearchTimer = null
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
      slotsDate.value = found.startAt.slice(0, 10)
      currentMonthReference.value = slotsDate.value
    } catch (error) {
      setError(error, 'No se pudo cargar la cita.')
      appointment.value = null
    } finally {
      loading.value = false
    }
  }

  const loadPatients = async (search = '') => {
    patientsLoading.value = true

    try {
      const loadedPatients = await dependencies.listAppointmentPatientsUseCase.execute({ search })
      patients.value = loadedPatients

      const matchingSelectedPatient = loadedPatients.find((patient) => patient.id === form.patientId)
      if (matchingSelectedPatient) {
        selectedPatient.value = matchingSelectedPatient
      }
    } catch (error) {
      setError(error, 'No se pudieron cargar los pacientes para editar la cita.')
    } finally {
      patientsLoading.value = false
    }
  }

  const loadServices = async (search = '') => {
    servicesLoading.value = true

    try {
      const loadedServices = await dependencies.listAppointmentServicesUseCase.execute({ search })
      services.value = loadedServices
      loadedServices.forEach((service) => {
        servicePriceById[service.id] = service.price
      })

      const matchingSelectedService = loadedServices.find((service) => service.id === form.serviceId)
      if (matchingSelectedService) {
        selectedService.value = matchingSelectedService
      }
    } catch (error) {
      setError(error, 'No se pudieron cargar los servicios para editar la cita.')
    } finally {
      servicesLoading.value = false
    }
  }

  const loadFormOptions = async () => {
    try {
      await Promise.all([
        loadPatients(),
        loadServices(),
      ])
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

  const currentMonthTitle = computed(() => {
    const reference = calendarMonth.value?.monthStart ?? currentMonthReference.value ?? slotsDate.value
    if (!reference) return ''
    const baseDate = parseLocalDate(reference)
    return `${monthNames[baseDate.getMonth()]} ${baseDate.getFullYear()}`
  })

  const selectedDateDisplay = computed(() => {
    if (!slotsDate.value) return ''
    return dateFieldFormatter.format(parseLocalDate(slotsDate.value))
  })

  const selectedSlotLabel = computed(() => {
    if (!selectedSlotStartsAt.value) return ''
    return toAppTimeLabel(new Date(selectedSlotStartsAt.value))
  })

  const selectedPatientLabel = computed(() => selectedPatient.value?.fullName || 'Selecciona un paciente')
  const selectedServiceLabel = computed(() => {
    if (!selectedService.value) return 'Selecciona un servicio'
    return `${selectedService.value.name} · ${selectedService.value.defaultDurationMinutes} min`
  })

  const canSubmitAppointmentChanges = computed(() => Boolean(
    form.patientId &&
    form.serviceId &&
    selectedSlotStartsAt.value &&
    !pending.value,
  ))

  const formatTime = (isoString: string) => toAppTimeLabel(new Date(isoString))

  const loadCalendarMonth = async (referenceDate = slotsDate.value) => {
    if (!referenceDate) return

    calendarLoading.value = true

    try {
      calendarMonth.value = await dependencies.getCalendarMonthUseCase.execute(referenceDate)
      currentMonthReference.value = referenceDate
    } catch (error) {
      setError(error, 'No se pudo cargar el calendario.')
    } finally {
      calendarLoading.value = false
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
    selectedSlotStartsAt.value = slot.startsAt
    form.startAt = fromIsoToDatetimeLocalValue(slot.startsAt)
  }

  const selectDate = async (date: string) => {
    const previousMonth = slotsDate.value ? parseLocalDate(slotsDate.value).getMonth() : -1
    const nextMonth = parseLocalDate(date).getMonth()

    slotsDate.value = date

    if (!selectedSlotStartsAt.value || !selectedSlotStartsAt.value.startsWith(date)) {
      selectedSlotStartsAt.value = null
    }

    if (previousMonth !== nextMonth || !calendarMonth.value) {
      await loadCalendarMonth(date)
    } else if (calendarMonth.value) {
      calendarMonth.value = { ...calendarMonth.value, selectedDate: date }
    }

    await loadAvailableSlots()
  }

  const openPatientPicker = async () => {
    isPatientPickerOpen.value = true
    patientSearch.value = ''
    await loadPatients()
  }

  const closePatientPicker = () => {
    isPatientPickerOpen.value = false
    patientSearch.value = ''
  }

  const selectPatient = (patient: Patient) => {
    selectedPatient.value = patient
    form.patientId = patient.id
    patientSearch.value = ''
    isPatientPickerOpen.value = false
  }

  const openServicePicker = async () => {
    isServicePickerOpen.value = true
    serviceSearch.value = ''
    await loadServices()
  }

  const closeServicePicker = () => {
    isServicePickerOpen.value = false
    serviceSearch.value = ''
  }

  const resolveServicePrice = (serviceId: string) => {
    if (!serviceId) return ''
    if (serviceId in servicePriceById) {
      return servicePriceById[serviceId] ?? ''
    }
    return ''
  }

  const selectService = (service: MedicalService) => {
    const previousServiceId = form.serviceId
    const previousPrice = previousServiceId ? resolveServicePrice(previousServiceId) : ''

    selectedService.value = service
    form.serviceId = service.id
    serviceSearch.value = ''
    isServicePickerOpen.value = false

    if (form.agreedPrice === '' || form.agreedPrice === previousPrice) {
      form.agreedPrice = resolveServicePrice(service.id)
    }
  }

  const goToPrevMonth = async () => {
    const nextReference = shiftMonth(currentMonthReference.value || slotsDate.value, -1)
    currentMonthReference.value = nextReference
    await loadCalendarMonth(nextReference)
  }

  const goToNextMonth = async () => {
    const nextReference = shiftMonth(currentMonthReference.value || slotsDate.value, 1)
    currentMonthReference.value = nextReference
    await loadCalendarMonth(nextReference)
  }

  // Recarga los huecos disponibles cuando cambia el dia explorado o el
  // servicio (la duracion del servicio cambia el tamaño de los huecos)
  watch([slotsDate, () => form.serviceId], () => {
    if (isEditing.value) void loadAvailableSlots()
  })

  watch(patientSearch, (nextValue) => {
    clearPatientSearchTimer()
    patientSearchTimer = setTimeout(() => {
      void loadPatients(nextValue)
      patientSearchTimer = null
    }, 250)
  })

  watch(serviceSearch, (nextValue) => {
    clearServiceSearchTimer()
    serviceSearchTimer = setTimeout(() => {
      void loadServices(nextValue)
      serviceSearchTimer = null
    }, 250)
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
    currentMonthReference.value = slotsDate.value
    void loadCalendarMonth(slotsDate.value)
    void loadAvailableSlots()
  }

  const cancelEditing = () => {
    if (appointment.value) syncForm(appointment.value)
    slotsDate.value = appointment.value?.startAt.slice(0, 10) ?? ''
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
        startAt: selectedSlotStartsAt.value ?? form.startAt,
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
    selectedPatient,
    patientSearch,
    patientsLoading,
    isPatientPickerOpen,
    services,
    selectedService,
    serviceSearch,
    servicesLoading,
    isServicePickerOpen,
    sessionContext,
    form,
    calendarMonth,
    calendarLoading,
    currentMonthTitle,
    selectedDateDisplay,
    selectedSlotStartsAt,
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
    shortWeekDays,
    selectedSlotLabel,
    selectedPatientLabel,
    selectedServiceLabel,
    canSubmitAppointmentChanges,
    appointmentStatusesForUi,
    canEditAppointment,
    canCancelAppointment,
    canChangeAppointmentStatus,
    canRegisterPayment,
    registerPaymentHref,
    formatTime,
    loadAppointment,
    loadFormOptions,
    loadSessionContext,
    loadCalendarMonth,
    loadAvailableSlots,
    selectSlot,
    selectDate,
    openPatientPicker,
    closePatientPicker,
    selectPatient,
    openServicePicker,
    closeServicePicker,
    selectService,
    goToPrevMonth,
    goToNextMonth,
    startEditing,
    cancelEditing,
    submitAppointment,
    submitStatus,
    submitStatusSelection,
    submitCancellation,
  }
}
