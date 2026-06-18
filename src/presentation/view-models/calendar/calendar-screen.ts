import { ref, computed } from 'vue'
import type { CalendarDayDto, CalendarWeekDto } from '../../../application/dto/calendar'
import type { GetCalendarDayFrontendUseCase } from '../../../application/use-cases/calendar/frontend/get-calendar-day'
import type { GetCalendarWeekFrontendUseCase } from '../../../application/use-cases/calendar/frontend/get-calendar-week'

export type CalendarViewMode = 'day' | 'week'

export interface CalendarScreenDependencies {
  getCalendarDayUseCase: GetCalendarDayFrontendUseCase
  getCalendarWeekUseCase: GetCalendarWeekFrontendUseCase
}

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function getMondayOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const fullDayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

export function createCalendarScreen(deps: CalendarScreenDependencies) {
  const viewMode = ref<CalendarViewMode>('day')
  const currentDate = ref(new Date())
  const calendarDay = ref<CalendarDayDto | null>(null)
  const calendarWeek = ref<CalendarWeekDto | null>(null)
  const loading = ref(false)
  const errorMessage = ref('')

  const currentDateLabel = computed(() => {
    const d = currentDate.value
    if (viewMode.value === 'day') {
      return `${fullDayNames[d.getDay()]}, ${d.getDate()} de ${monthNames[d.getMonth()]} ${d.getFullYear()}`
    }
    const monday = getMondayOfWeek(d)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    return `${monday.getDate()} – ${sunday.getDate()} de ${monthNames[monday.getMonth()]} ${monday.getFullYear()}`
  })

  const isToday = computed(() => {
    const today = new Date()
    const d = currentDate.value
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    )
  })

  async function load() {
    loading.value = true
    errorMessage.value = ''

    try {
      if (viewMode.value === 'day') {
        calendarDay.value = await deps.getCalendarDayUseCase.execute(toDateString(currentDate.value))
      } else {
        calendarWeek.value = await deps.getCalendarWeekUseCase.execute(toDateString(currentDate.value))
      }
    } catch {
      errorMessage.value = 'No se pudo cargar la agenda. Intente de nuevo.'
    } finally {
      loading.value = false
    }
  }

  function goToPrev() {
    const d = new Date(currentDate.value)
    if (viewMode.value === 'day') {
      d.setDate(d.getDate() - 1)
    } else {
      d.setDate(d.getDate() - 7)
    }
    currentDate.value = d
    load()
  }

  function goToNext() {
    const d = new Date(currentDate.value)
    if (viewMode.value === 'day') {
      d.setDate(d.getDate() + 1)
    } else {
      d.setDate(d.getDate() + 7)
    }
    currentDate.value = d
    load()
  }

  function goToToday() {
    currentDate.value = new Date()
    load()
  }

  function setViewMode(mode: CalendarViewMode) {
    viewMode.value = mode
    load()
  }

  function formatTime(isoString: string): string {
    return new Date(isoString).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
  }

  function formatDateLabel(dateStr: string): string {
    const [y, m, d] = dateStr.split('-').map(Number)
    const date = new Date(y!, m! - 1, d!)
    return `${dayNames[date.getDay()]} ${date.getDate()}`
  }

  return {
    viewMode,
    currentDate,
    currentDateLabel,
    isToday,
    calendarDay,
    calendarWeek,
    loading,
    errorMessage,
    dayNames,
    load,
    goToPrev,
    goToNext,
    goToToday,
    setViewMode,
    formatTime,
    formatDateLabel,
  }
}

export type CalendarScreen = ReturnType<typeof createCalendarScreen>
