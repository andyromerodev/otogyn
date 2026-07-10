import { computed, reactive, ref } from 'vue'
import { formatLocalDate } from '../../../application/utils/date/local-date'
import type { BlockedTimeSlot } from '../../../domain/entities/blocked-time-slot'
import type { DoctorAvailability } from '../../../domain/entities/doctor-availability'
import type { AvailabilityViewModelDependencies } from './availability-view-model.module'

export type { AvailabilityViewModelPort, AvailabilityViewModelDependencies } from './availability-view-model.module'

const createInitialForm = () => ({
  weekdays: [1] as number[],
  startTime: '09:00',
  endTime: '18:00',
  isActive: true,
})

const createBlockForm = () => ({
  startDate: formatLocalDate(new Date()),
  endDate: formatLocalDate(new Date()),
  startTime: '13:00',
  endTime: '14:00',
  reason: '',
})

const weekdays = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

export const createAvailabilityViewModel = (dependencies: AvailabilityViewModelDependencies) => {
  const availabilities = ref<DoctorAvailability[]>([])
  const blockedSlots = ref<BlockedTimeSlot[]>([])
  const sessionRole = ref<'admin_doctor' | 'assistant'>('assistant')
  const loading = ref(false)
  const pending = ref(false)
  const togglingId = ref<string | null>(null)
  const deletingSlotId = ref<string | null>(null)
  const editingId = ref<string | null>(null)
  const errorMessage = ref<string | null>(null)
  const successMessage = ref<string | null>(null)

  const form = reactive(createInitialForm())
  const blockForm = reactive(createBlockForm())

  const canManageAvailability = computed(() => sessionRole.value === 'admin_doctor')
  const weekdaysList = weekdays

  const loadAvailability = async () => {
    loading.value = true
    errorMessage.value = null

    try {
      const [avail, slots, session] = await Promise.all([
        dependencies.listAvailabilityUseCase.execute(),
        dependencies.listUpcomingBlockedSlotsUseCase.execute(),
        dependencies.getSessionContext.execute(),
      ])

      availabilities.value = avail
      blockedSlots.value = slots
      sessionRole.value = session.role
    } catch (error) {
      errorMessage.value =
        error && typeof error === 'object' && 'statusMessage' in error && typeof error.statusMessage === 'string'
          ? error.statusMessage
          : 'No se pudo cargar la disponibilidad.'
    } finally {
      loading.value = false
    }
  }

  const startEditingAvailability = (avail: DoctorAvailability) => {
    editingId.value = avail.id
    form.weekdays = [avail.weekday]
    form.startTime = avail.startTime
    form.endTime = avail.endTime
    form.isActive = avail.isActive
    errorMessage.value = null
    successMessage.value = null
  }

  const cancelEditingAvailability = () => {
    editingId.value = null
    Object.assign(form, createInitialForm())
  }

  const toggleWeekday = (day: number) => {
    const idx = form.weekdays.indexOf(day)
    if (idx === -1) {
      form.weekdays = [...form.weekdays, day].sort((a, b) => a - b)
    } else {
      form.weekdays = form.weekdays.filter((d) => d !== day)
    }
  }

  const submitAvailability = async () => {
    if (form.weekdays.length === 0) {
      errorMessage.value = 'Selecciona al menos un día de la semana.'
      return
    }

    pending.value = true
    errorMessage.value = null
    successMessage.value = null

    try {
      if (editingId.value) {
        await dependencies.updateAvailabilityUseCase.execute({
          id: editingId.value,
          weekday: form.weekdays[0],
          startTime: form.startTime,
          endTime: form.endTime,
          isActive: form.isActive,
        })
        cancelEditingAvailability()
        successMessage.value = 'Horario actualizado correctamente.'
      } else {
        const count = form.weekdays.length
        await dependencies.createBulkAvailabilityUseCase.execute({
          weekdays: form.weekdays,
          startTime: form.startTime,
          endTime: form.endTime,
          isActive: form.isActive,
        })
        Object.assign(form, createInitialForm())
        successMessage.value = count > 1 ? 'Horarios registrados correctamente.' : 'Horario registrado correctamente.'
      }

      await loadAvailability()
    } catch (error) {
      console.error('[availability][save][client] request failed', { error })

      errorMessage.value =
        error && typeof error === 'object' && 'statusMessage' in error && typeof error.statusMessage === 'string'
          ? error.statusMessage
          : 'No se pudo guardar el horario.'
    } finally {
      pending.value = false
    }
  }

  const toggleAvailabilityActive = async (id: string) => {
    togglingId.value = id
    errorMessage.value = null
    successMessage.value = null

    try {
      await dependencies.toggleAvailabilityActiveUseCase.execute(id)
      successMessage.value = 'Estado del horario actualizado.'
      await loadAvailability()
    } catch (error) {
      console.error('[availability][toggle][client] request failed', { error })

      errorMessage.value =
        error && typeof error === 'object' && 'statusMessage' in error && typeof error.statusMessage === 'string'
          ? error.statusMessage
          : 'No se pudo cambiar el estado del horario.'
    } finally {
      togglingId.value = null
    }
  }

  const submitBlockedSlot = async () => {
    pending.value = true
    errorMessage.value = null
    successMessage.value = null

    try {
      await dependencies.createBulkBlockedSlotsUseCase.execute({
        startDate: blockForm.startDate,
        endDate: blockForm.endDate || blockForm.startDate,
        startTime: blockForm.startTime,
        endTime: blockForm.endTime,
        reason: blockForm.reason.trim() || null,
      })

      Object.assign(blockForm, { ...createBlockForm(), startDate: blockForm.startDate, endDate: blockForm.startDate })
      successMessage.value = 'Bloqueo registrado correctamente.'
      await loadAvailability()
    } catch (error) {
      console.error('[availability][blocked][create][client] request failed', { error })

      errorMessage.value =
        error && typeof error === 'object' && 'statusMessage' in error && typeof error.statusMessage === 'string'
          ? error.statusMessage
          : 'No se pudo registrar el bloqueo.'
    } finally {
      pending.value = false
    }
  }

  const deleteBlockedSlot = async (id: string) => {
    deletingSlotId.value = id
    errorMessage.value = null
    successMessage.value = null

    try {
      await dependencies.deleteBlockedSlotUseCase.execute(id)
      successMessage.value = 'Bloqueo eliminado correctamente.'
      await loadAvailability()
    } catch (error) {
      console.error('[availability][blocked][delete][client] request failed', { error })

      errorMessage.value =
        error && typeof error === 'object' && 'statusMessage' in error && typeof error.statusMessage === 'string'
          ? error.statusMessage
          : 'No se pudo eliminar el bloqueo.'
    } finally {
      deletingSlotId.value = null
    }
  }

  return {
    availabilities,
    blockedSlots,
    sessionRole,
    form,
    blockForm,
    loading,
    pending,
    togglingId,
    deletingSlotId,
    editingId,
    errorMessage,
    successMessage,
    canManageAvailability,
    weekdaysList,
    loadAvailability,
    startEditingAvailability,
    cancelEditingAvailability,
    toggleWeekday,
    submitAvailability,
    toggleAvailabilityActive,
    submitBlockedSlot,
    deleteBlockedSlot,
  }
}
