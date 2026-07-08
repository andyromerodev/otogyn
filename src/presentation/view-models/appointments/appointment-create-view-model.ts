import { computed, reactive, ref, watch } from 'vue'
import type { AppointmentSlotDto } from '../../../application/dto/appointment-management'
import { formatLocalDate, parseLocalDate, toAppTimeLabel } from '../../../application/utils/date/local-date'
import type { Appointment } from '../../../domain/entities/appointment'
import type { CalendarMonthDto } from '../../../application/dto/calendar'
import type { MedicalService } from '../../../domain/entities/medical-service'
import type { Patient } from '../../../domain/entities/patient'
import { createInitialAppointmentForm, normalizeApiError } from './appointment-view-model.types'
import type { AppointmentCreateViewModelDependencies } from './appointment-create-view-model.module'

export type { AppointmentCreateViewModelDependencies } from './appointment-create-view-model.module'

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

// Factory del ViewModel — equivale al constructor de AppointmentCreateViewModel : ViewModel()
export const createAppointmentCreateViewModel = (dependencies: AppointmentCreateViewModelDependencies) => {
  // Como StateFlow<List<Patient>> — resultados de búsqueda del picker de pacientes
  const patients = ref<Patient[]>([])
  const selectedPatient = ref<Patient | null>(null)
  const patientSearch = ref('')
  const patientsLoading = ref(false)
  const hasPatientsAvailable = ref(false)
  const isPatientPickerOpen = ref(false)

  // Como StateFlow<List<MedicalService>> — resultados de búsqueda del picker de servicios
  const services = ref<MedicalService[]>([])
  const selectedService = ref<MedicalService | null>(null)
  const serviceSearch = ref('')
  const servicesLoading = ref(false)
  const hasServicesAvailable = ref(false)
  const isServicePickerOpen = ref(false)

  // Como StateFlow<Boolean> — carga de opciones del formulario (pacientes y servicios)
  const loading = ref(false)

  // Como StateFlow<Boolean> — operación de creación de cita en curso
  const pending = ref(false)

  // Como StateFlow<String?> — mensaje de error, expuesto read-only a la UI
  const errorMessage = ref<string | null>(null)

  // Como StateFlow<ErrorKind?> — 'validation' (accionable) vs 'server' (tecnico),
  // permite a la UI distinguir "revisa esto" de "algo fallo, intenta de nuevo"
  const errorKind = ref<'validation' | 'server' | null>(null)

  // Como StateFlow<String?> — mensaje de éxito tras crear la cita
  const successMessage = ref<string | null>(null)

  // Como StateFlow<Appointment?> — cita recién creada, null hasta que el submit tiene éxito
  const createdAppointment = ref<Appointment | null>(null)
  const calendarMonth = ref<CalendarMonthDto | null>(null)
  const selectedDate = ref(createInitialAppointmentForm().startAt.slice(0, 10))
  const selectedSlotStartsAt = ref<string | null>(null)
  const availableSlots = ref<AppointmentSlotDto[]>([])
  const calendarLoading = ref(false)
  const slotsLoading = ref(false)

  // Como MutableStateFlow<AppointmentFormState> — estado mutable del formulario,
  // con valores por defecto (primer paciente/servicio disponible, hora de inicio a las 9am)
  const form = reactive(createInitialAppointmentForm())
  let patientSearchTimer: ReturnType<typeof setTimeout> | null = null
  let serviceSearchTimer: ReturnType<typeof setTimeout> | null = null
  const servicePriceById = reactive<Record<string, number | null>>({})
  const currentMonthReference = ref(selectedDate.value)

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

  const syncDefaultSelections = () => {
    if (!form.patientId && patients.value[0]) {
      selectedPatient.value = patients.value[0]
      form.patientId = patients.value[0].id
    }
    if (!form.serviceId && services.value[0]) {
      selectedService.value = services.value[0]
      form.serviceId = services.value[0].id
    }
  }

  const resolveServicePrice = (serviceId: string) => {
    if (!serviceId) return ''

    if (serviceId in servicePriceById) {
      return servicePriceById[serviceId] ?? ''
    }

    return ''
  }

  const currentMonthTitle = computed(() => {
    const baseDate = calendarMonth.value?.monthStart ? parseLocalDate(calendarMonth.value.monthStart) : parseLocalDate(currentMonthReference.value)
    return `${monthNames[baseDate.getMonth()]} ${baseDate.getFullYear()}`
  })

  const canSubmit = computed(() => Boolean(
    form.patientId &&
    form.serviceId &&
    selectedDate.value &&
    selectedSlotStartsAt.value &&
    !pending.value,
  ))

  const selectedSlotLabel = computed(() => {
    if (!selectedSlotStartsAt.value) return ''
    return toAppTimeLabel(new Date(selectedSlotStartsAt.value))
  })

  const selectedDateDisplay = computed(() => dateFieldFormatter.format(parseLocalDate(selectedDate.value)))
  const selectedPatientLabel = computed(() => selectedPatient.value?.fullName || 'Selecciona un paciente')
  const selectedServiceLabel = computed(() => {
    if (!selectedService.value) return 'Selecciona un servicio'
    return `${selectedService.value.name} · ${selectedService.value.defaultDurationMinutes} min`
  })

  const formatTime = (isoString: string) => toAppTimeLabel(new Date(isoString))

  const loadCalendarMonth = async (referenceDate = selectedDate.value) => {
    calendarLoading.value = true

    try {
      calendarMonth.value = await dependencies.getCalendarMonthUseCase.execute(referenceDate)
      currentMonthReference.value = referenceDate
    } catch (error) {
      const normalized = normalizeApiError(error, 'No se pudo cargar el calendario.')
      errorMessage.value = normalized.message
      errorKind.value = normalized.kind
    } finally {
      calendarLoading.value = false
    }
  }

  const syncStartAtFromSelection = () => {
    form.startAt = selectedSlotStartsAt.value ?? `${selectedDate.value}T09:00`
  }

  const loadAvailableSlots = async () => {
    if (!form.serviceId || !selectedDate.value) {
      availableSlots.value = []
      selectedSlotStartsAt.value = null
      syncStartAtFromSelection()
      return
    }

    slotsLoading.value = true

    try {
      const slots = await dependencies.getAppointmentAvailableSlotsUseCase.execute({
        date: selectedDate.value,
        serviceId: form.serviceId,
      })

      availableSlots.value = slots

      const currentStillExists = selectedSlotStartsAt.value
        ? slots.some((slot) => slot.startsAt === selectedSlotStartsAt.value)
        : false

      if (!currentStillExists) {
        selectedSlotStartsAt.value = null
        syncStartAtFromSelection()
      }
    } catch (error) {
      availableSlots.value = []
      selectedSlotStartsAt.value = null
      syncStartAtFromSelection()
      const normalized = normalizeApiError(error, 'No se pudieron cargar los horarios disponibles.')
      errorMessage.value = normalized.message
      errorKind.value = normalized.kind
    } finally {
      slotsLoading.value = false
    }
  }

  const selectSlot = (startsAt: string) => {
    selectedSlotStartsAt.value = startsAt
    form.startAt = startsAt
  }

  const selectDate = async (date: string) => {
    const previousMonth = parseLocalDate(selectedDate.value).getMonth()
    const nextMonth = parseLocalDate(date).getMonth()

    selectedDate.value = date
    selectedSlotStartsAt.value = null
    syncStartAtFromSelection()

    if (previousMonth !== nextMonth || !calendarMonth.value) {
      await loadCalendarMonth(date)
    } else if (calendarMonth.value) {
      calendarMonth.value = { ...calendarMonth.value, selectedDate: date }
    }

    await loadAvailableSlots()
  }

  const goToPrevMonth = async () => {
    const nextReference = shiftMonth(currentMonthReference.value, -1)
    currentMonthReference.value = nextReference
    await loadCalendarMonth(nextReference)
  }

  const goToNextMonth = async () => {
    const nextReference = shiftMonth(currentMonthReference.value, 1)
    currentMonthReference.value = nextReference
    await loadCalendarMonth(nextReference)
  }

  const loadPatients = async (search = '') => {
    patientsLoading.value = true

    try {
      const loadedPatients = await dependencies.listAppointmentPatientsUseCase.execute({ search })

      patients.value = loadedPatients
      if (!search.trim()) {
        hasPatientsAvailable.value = loadedPatients.length > 0
      }

      if (!search.trim() && !form.patientId && loadedPatients[0]) {
        selectedPatient.value = loadedPatients[0]
        form.patientId = loadedPatients[0].id
        return
      }

      const matchingSelectedPatient = loadedPatients.find((patient) => patient.id === form.patientId)

      if (matchingSelectedPatient) {
        selectedPatient.value = matchingSelectedPatient
      }
    } catch (error) {
      const normalized = normalizeApiError(error, 'No se pudieron cargar los pacientes.')
      errorMessage.value = normalized.message
      errorKind.value = normalized.kind
    } finally {
      patientsLoading.value = false
    }
  }

  const selectPatient = (patient: Patient) => {
    selectedPatient.value = patient
    form.patientId = patient.id
    patientSearch.value = ''
    isPatientPickerOpen.value = false
  }

  const loadServices = async (search = '') => {
    servicesLoading.value = true

    try {
      const loadedServices = await dependencies.listAppointmentServicesUseCase.execute({ search })

      services.value = loadedServices
      loadedServices.forEach((service) => {
        servicePriceById[service.id] = service.price
      })

      if (!search.trim()) {
        hasServicesAvailable.value = loadedServices.length > 0
      }

      if (!search.trim() && !form.serviceId && loadedServices[0]) {
        selectedService.value = loadedServices[0]
        form.serviceId = loadedServices[0].id
        return
      }

      const matchingSelectedService = loadedServices.find((service) => service.id === form.serviceId)

      if (matchingSelectedService) {
        selectedService.value = matchingSelectedService
      }
    } catch (error) {
      const normalized = normalizeApiError(error, 'No se pudieron cargar los servicios.')
      errorMessage.value = normalized.message
      errorKind.value = normalized.kind
    } finally {
      servicesLoading.value = false
    }
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

  // Equivale a fun loadFormOptions() — carga paralela de pacientes y servicios disponibles
  const loadFormOptions = async () => {
    loading.value = true
    errorMessage.value = null
    errorKind.value = null

    try {
      await Promise.all([
        loadPatients(),
        loadServices(),
        loadCalendarMonth(selectedDate.value),
      ])
      syncDefaultSelections()
      if (form.serviceId) {
        form.agreedPrice = resolveServicePrice(form.serviceId)
      }
      syncStartAtFromSelection()
      await loadAvailableSlots()
    } catch (error) {
      const normalized = normalizeApiError(error, 'No se pudieron cargar los datos para registrar la cita.')
      errorMessage.value = normalized.message
      errorKind.value = normalized.kind
    } finally {
      loading.value = false
    }
  }

  // Equivale a fun onSubmitAppointment() — lanza el UseCase y actualiza los StateFlows
  const submitAppointment = async () => {
    if (!selectedSlotStartsAt.value) {
      errorMessage.value = 'Debes elegir una fecha y un horario disponible.'
      errorKind.value = 'validation'
      return
    }

    pending.value = true
    errorMessage.value = null
    errorKind.value = null
    successMessage.value = null

    try {
      createdAppointment.value = await dependencies.createAppointmentUseCase.execute({
        patientId: form.patientId,
        serviceId: form.serviceId,
        agreedPrice: form.agreedPrice === '' ? null : Number(form.agreedPrice),
        startAt: form.startAt,
        isUrgent: form.isUrgent,
        reason: form.reason.trim() || null,
        notes: form.notes.trim() || null,
      })

      successMessage.value = 'Cita registrada correctamente.'
    } catch (error) {
      const normalized = normalizeApiError(error, 'No se pudo registrar la cita.')
      errorMessage.value = normalized.message
      errorKind.value = normalized.kind
    } finally {
      pending.value = false
    }
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

  const openServicePicker = async () => {
    isServicePickerOpen.value = true
    serviceSearch.value = ''
    await loadServices()
  }

  const closeServicePicker = () => {
    isServicePickerOpen.value = false
    serviceSearch.value = ''
  }

  watch(() => form.serviceId, (nextServiceId, previousServiceId) => {
    if (!nextServiceId) {
      availableSlots.value = []
      selectedSlotStartsAt.value = null
      syncStartAtFromSelection()
      return
    }

    const previousPrice = previousServiceId ? resolveServicePrice(previousServiceId) : ''
    if (form.agreedPrice === '' || form.agreedPrice === previousPrice) {
      form.agreedPrice = resolveServicePrice(nextServiceId)
    }

    selectedSlotStartsAt.value = null
    syncStartAtFromSelection()
    void loadAvailableSlots()
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

  return {
    patients,
    selectedPatient,
    patientSearch,
    patientsLoading,
    hasPatientsAvailable,
    isPatientPickerOpen,
    services,
    selectedService,
    serviceSearch,
    servicesLoading,
    hasServicesAvailable,
    isServicePickerOpen,
    calendarMonth,
    selectedDate,
    selectedSlotStartsAt,
    availableSlots,
    calendarLoading,
    slotsLoading,
    form,
    loading,
    pending,
    errorMessage,
    errorKind,
    successMessage,
    createdAppointment,
    shortWeekDays,
    currentMonthTitle,
    selectedDateDisplay,
    selectedPatientLabel,
    selectedServiceLabel,
    canSubmit,
    selectedSlotLabel,
    formatTime,
    selectPatient,
    loadPatients,
    selectService,
    loadServices,
    selectDate,
    selectSlot,
    goToPrevMonth,
    goToNextMonth,
    openPatientPicker,
    closePatientPicker,
    openServicePicker,
    closeServicePicker,
    loadFormOptions,
    submitAppointment,
  }
}
