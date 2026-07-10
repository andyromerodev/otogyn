import { reactive, ref, watch } from 'vue'
import type { PublicBookingResult, PublicServiceDto, PublicSlotDto } from '../../../application/dto/public-booking'
import { APP_TIME_ZONE, formatLocalDate, parseLocalDate, toAppTimeLabel } from '../../../application/utils/date/local-date'
import type { GetPublicServicesFrontendUseCase } from '../../../application/use-cases/booking/frontend/get-public-services'
import type { GetPublicSlotsFrontendUseCase } from '../../../application/use-cases/booking/frontend/get-public-slots'
import type { CreatePublicBookingFrontendUseCase } from '../../../application/use-cases/booking/frontend/create-public-booking'

export type BookingStep = 1 | 2 | 3 | 4

export interface BookingScreenDependencies {
  getPublicServicesUseCase: GetPublicServicesFrontendUseCase
  getPublicSlotsUseCase: GetPublicSlotsFrontendUseCase
  createPublicBookingUseCase: CreatePublicBookingFrontendUseCase
}

function todayString(): string {
  return formatLocalDate(new Date())
}

const SERVICE_PAGE_SIZE = 12

export function createBookingScreen(deps: BookingScreenDependencies) {
  const step = ref<BookingStep>(1)
  const services = ref<PublicServiceDto[]>([])
  const serviceSearch = ref('')
  const servicePage = ref(1)
  const serviceTotal = ref(0)
  const serviceTotalPages = ref(1)
  const selectedService = ref<PublicServiceDto | null>(null)
  const selectedDate = ref(todayString())
  const slots = ref<PublicSlotDto[]>([])
  const selectedSlot = ref<PublicSlotDto | null>(null)
  const bookingResult = ref<PublicBookingResult | null>(null)
  const loading = ref(false)
  const slotsLoading = ref(false)
  const errorMessage = ref('')

  let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null
  watch(serviceSearch, () => {
    if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
    searchDebounceTimer = setTimeout(() => {
      servicePage.value = 1
      void loadServices()
    }, 250)
  })

  const form = reactive({
    name: '',
    phone: '',
    email: '',
    reason: '',
    website: '',
  })

  async function loadServices() {
    loading.value = true
    errorMessage.value = ''
    try {
      const result = await deps.getPublicServicesUseCase.execute({
        search: serviceSearch.value.trim() || undefined,
        page: servicePage.value,
        pageSize: SERVICE_PAGE_SIZE,
      })
      services.value = result.items
      serviceTotal.value = result.total
      serviceTotalPages.value = result.totalPages
      servicePage.value = result.page
    } catch {
      errorMessage.value = 'No se pudieron cargar los servicios. Intente de nuevo.'
    } finally {
      loading.value = false
    }
  }

  async function goToServicePage(page: number) {
    if (page < 1 || page > serviceTotalPages.value || page === servicePage.value) return
    servicePage.value = page
    await loadServices()
  }

  async function loadSlots() {
    if (!selectedService.value) return
    slotsLoading.value = true
    errorMessage.value = ''
    slots.value = []
    try {
      slots.value = await deps.getPublicSlotsUseCase.execute(selectedService.value.id, selectedDate.value)
    } catch {
      errorMessage.value = 'No se pudo consultar disponibilidad. Intente de nuevo.'
    } finally {
      slotsLoading.value = false
    }
  }

  function selectService(service: PublicServiceDto) {
    selectedService.value = service
    selectedSlot.value = null
    slots.value = []
    step.value = 2
    loadSlots()
  }

  function selectSlot(slot: PublicSlotDto) {
    selectedSlot.value = slot
    step.value = 3
  }

  function goBack() {
    errorMessage.value = ''
    if (step.value === 2) step.value = 1
    else if (step.value === 3) step.value = 2
  }

  async function submitBooking() {
    if (!selectedService.value || !selectedSlot.value) return
    loading.value = true
    errorMessage.value = ''
    try {
      bookingResult.value = await deps.createPublicBookingUseCase.execute({
        serviceId: selectedService.value.id,
        startAt: selectedSlot.value.startsAt,
        patientName: form.name.trim(),
        patientPhone: form.phone.trim(),
        patientEmail: form.email.trim() || null,
        reason: form.reason.trim() || null,
        website: form.website,
      })
      step.value = 4
    } catch (err: unknown) {
      const message = err && typeof err === 'object' && 'data' in err
        ? (err as { data?: { message?: string } }).data?.message
        : null
      errorMessage.value = message ?? 'No se pudo registrar la reserva. Intente de nuevo.'
    } finally {
      loading.value = false
    }
  }

  function reset() {
    step.value = 1
    selectedService.value = null
    selectedSlot.value = null
    selectedDate.value = todayString()
    slots.value = []
    bookingResult.value = null
    errorMessage.value = ''
    serviceSearch.value = ''
    servicePage.value = 1
    form.name = ''
    form.phone = ''
    form.email = ''
    form.reason = ''
    form.website = ''
  }

  function formatTime(isoString: string): string {
    return toAppTimeLabel(new Date(isoString))
  }

  function formatDate(dateStr: string): string {
    const date = parseLocalDate(dateStr)
    return date.toLocaleDateString('es-PE', {
      timeZone: APP_TIME_ZONE,
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  return {
    step,
    services,
    serviceSearch,
    servicePage,
    serviceTotal,
    serviceTotalPages,
    selectedService,
    selectedDate,
    slots,
    selectedSlot,
    bookingResult,
    loading,
    slotsLoading,
    errorMessage,
    form,
    loadServices,
    loadSlots,
    selectService,
    selectSlot,
    goBack,
    goToServicePage,
    submitBooking,
    reset,
    formatTime,
    formatDate,
  }
}

export type BookingScreen = ReturnType<typeof createBookingScreen>
