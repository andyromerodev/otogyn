import { computed, ref } from 'vue'
import type { CalendarDayDto, CalendarMonthDto } from '../../../application/dto/calendar'
import { formatLocalDate, parseLocalDate } from '../../../application/utils/date/local-date'
import type { GetCalendarDayFrontendUseCase } from '../../../application/use-cases/calendar/frontend/get-calendar-day'
import type { GetCalendarMonthFrontendUseCase } from '../../../application/use-cases/calendar/frontend/get-calendar-month'

export interface CalendarScreenDependencies {
  getCalendarMonthUseCase: GetCalendarMonthFrontendUseCase
  getCalendarDayUseCase: GetCalendarDayFrontendUseCase
}

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

export async function createCalendarScreen(deps: CalendarScreenDependencies) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const currentMonthDate = ref(new Date(today))
  const selectedDate = ref(new Date(today))
  const calendarMonth = ref<CalendarMonthDto | null>(null)
  const calendarDay = ref<CalendarDayDto | null>(null)
  const loading = ref(false)
  const dayLoading = ref(false)
  const errorMessage = ref('')

  const shortWeekDays = shortDayNames.slice(1).concat(shortDayNames[0]!)

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

export type CalendarScreen = Awaited<ReturnType<typeof createCalendarScreen>>
