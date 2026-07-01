import { computed, ref } from 'vue'
import type { CalendarDayDto, CalendarMonthDto } from '../../../application/dto/calendar'
import { formatLocalDate, parseLocalDate } from '../../../application/utils/date/local-date'
import type { CalendarViewModelDependencies } from './calendar-view-model.module'

export type { CalendarViewModelDependencies } from './calendar-view-model.module'

const shortDayNames = ['D', 'L', 'M', 'X', 'J', 'V', 'S']
const uppercaseDayNames = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO']
const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const uppercaseMonthNames = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE']

function isSameDay(left: Date, right: Date): boolean {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  )
}

function clampDay(year: number, month: number, day: number): Date {
  const lastDay = new Date(year, month + 1, 0).getDate()
  return new Date(year, month, Math.min(day, lastDay))
}

// Factory async del ViewModel — equivale al constructor de CalendarViewModel : ViewModel()
// Es async porque auto-dispara la carga inicial (loadMonthAndDay) antes de retornar,
// similar a un init { viewModelScope.launch { load() } } en Android
export async function createCalendarViewModel(deps: CalendarViewModelDependencies) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Como StateFlow<Date> — mes actualmente visible en el grid del calendario
  const currentMonthDate = ref(new Date(today))

  // Como StateFlow<Date> — día seleccionado por el usuario en el grid
  const selectedDate = ref(new Date(today))

  // Como StateFlow<CalendarMonthDto?> — datos del mes cargado (grid de días + citas)
  const calendarMonth = ref<CalendarMonthDto | null>(null)

  // Como StateFlow<CalendarDayDto?> — datos del día seleccionado (lista de citas del día)
  const calendarDay = ref<CalendarDayDto | null>(null)

  // Como StateFlow<Boolean> — carga del mes completo (grid + día)
  const loading = ref(false)

  // Como StateFlow<Boolean> — carga parcial solo del día seleccionado
  const dayLoading = ref(false)

  // Como StateFlow<String> — mensaje de error, expuesto read-only a la UI
  const errorMessage = ref('')

  const shortWeekDays = shortDayNames.slice(1).concat(shortDayNames[0]!)

  // Como derivedStateOf { } — etiquetas calculadas y cacheadas desde los StateFlows base
  const currentMonthLabel = computed(() => {
    const date = currentMonthDate.value
    return `${monthNames[date.getMonth()]} ${date.getFullYear()}`
  })

  const currentMonthTitle = computed(() => {
    const date = currentMonthDate.value
    return `${monthNames[date.getMonth()]} ${date.getFullYear()}`
  })

  const monthEyebrow = computed(() => {
    const date = currentMonthDate.value
    return `ORL · ${monthNames[date.getMonth()]} ${date.getFullYear()}`
  })

  const selectedDateHeading = computed(() => {
    const date = selectedDate.value
    if (isSameDay(date, today)) {
      return `HOY — ${date.getDate()} DE ${uppercaseMonthNames[date.getMonth()]}`
    }
    return `${uppercaseDayNames[date.getDay()]} — ${date.getDate()} DE ${uppercaseMonthNames[date.getMonth()]}`
  })

  // Equivale a fun loadMonthAndDay() — carga paralela del grid mensual y el día seleccionado
  async function loadMonthAndDay() {
    loading.value = true
    errorMessage.value = ''

    try {
      const selectedDateString = formatLocalDate(selectedDate.value)
      const [month, day] = await Promise.all([
        deps.getCalendarMonthUseCase.execute(selectedDateString),
        deps.getCalendarDayUseCase.execute(selectedDateString),
      ])

      calendarMonth.value = month
      calendarDay.value = day
    } catch {
      errorMessage.value = 'No se pudo cargar la agenda. Intente de nuevo.'
    } finally {
      loading.value = false
    }
  }

  // Equivale a fun loadDay() — recarga solo el panel de citas del día sin recargar el grid
  async function loadDay() {
    dayLoading.value = true
    errorMessage.value = ''

    try {
      calendarDay.value = await deps.getCalendarDayUseCase.execute(formatLocalDate(selectedDate.value))
    } catch {
      errorMessage.value = 'No se pudo cargar la agenda. Intente de nuevo.'
    } finally {
      dayLoading.value = false
    }
  }

  // Equivale a fun onSelectDate() — evento del grid al tocar un día
  async function selectDate(dateString: string) {
    const nextSelected = parseLocalDate(dateString)
    selectedDate.value = nextSelected

    const monthChanged =
      nextSelected.getFullYear() !== currentMonthDate.value.getFullYear() ||
      nextSelected.getMonth() !== currentMonthDate.value.getMonth()

    if (monthChanged) {
      currentMonthDate.value = new Date(nextSelected)
      await loadMonthAndDay()
      return
    }

    if (calendarMonth.value) {
      calendarMonth.value = { ...calendarMonth.value, selectedDate: dateString }
    }

    await loadDay()
  }

  // Equivale a fun onPrevMonth() / onNextMonth() — navegación entre meses
  async function goToPrevMonth() {
    const current = currentMonthDate.value
    const target = clampDay(current.getFullYear(), current.getMonth() - 1, selectedDate.value.getDate())
    currentMonthDate.value = new Date(target)
    selectedDate.value = new Date(target)
    await loadMonthAndDay()
  }

  async function goToNextMonth() {
    const current = currentMonthDate.value
    const target = clampDay(current.getFullYear(), current.getMonth() + 1, selectedDate.value.getDate())
    currentMonthDate.value = new Date(target)
    selectedDate.value = new Date(target)
    await loadMonthAndDay()
  }

  function formatTime(isoString: string): string {
    return new Date(isoString).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
  }

  await loadMonthAndDay()

  return {
    currentMonthDate,
    selectedDate,
    calendarMonth,
    calendarDay,
    loading,
    dayLoading,
    errorMessage,
    shortWeekDays,
    currentMonthLabel,
    currentMonthTitle,
    monthEyebrow,
    selectedDateHeading,
    selectDate,
    goToPrevMonth,
    goToNextMonth,
    formatTime,
  }
}

// Como typealias CalendarViewModel = ... — alias del tipo de retorno para usarlo en otros archivos
export type CalendarViewModel = Awaited<ReturnType<typeof createCalendarViewModel>>
