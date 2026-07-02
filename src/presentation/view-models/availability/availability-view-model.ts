import { computed, reactive, ref } from 'vue'
import { formatLocalDate, parseAppDateTime } from '../../../application/utils/date/local-date'
import type { BlockedTimeSlot } from '../../../domain/entities/blocked-time-slot'
import type { DoctorAvailability } from '../../../domain/entities/doctor-availability'
import type { AvailabilityViewModelDependencies } from './availability-view-model.module'

export type { AvailabilityViewModelPort, AvailabilityViewModelDependencies } from './availability-view-model.module'

const createInitialForm = () => ({
  weekday: 1,
  startTime: '09:00',
  endTime: '18:00',
  isActive: true,
})

const createBlockForm = () => ({
  date: formatLocalDate(new Date()),
  startTime: '13:00',
  endTime: '14:00',
  reason: '',
})

const weekdays = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado']

// Factory del ViewModel — equivale al constructor de AvailabilityViewModel : ViewModel()
export const createAvailabilityViewModel = (dependencies: AvailabilityViewModelDependencies) => {
  // Como StateFlow<List<DoctorAvailability>> — lista de franjas horarias registradas
  const availabilities = ref<DoctorAvailability[]>([])

  // Como StateFlow<List<BlockedTimeSlot>> — slots bloqueados (vacaciones, ausencias, etc.)
  const blockedSlots = ref<BlockedTimeSlot[]>([])

  // Como StateFlow<'admin_doctor' | 'assistant'> — rol del usuario autenticado
  const sessionRole = ref<'admin_doctor' | 'assistant'>('assistant')

  // Como StateFlow<Boolean> — carga inicial de disponibilidades
  const loading = ref(false)

  // Como StateFlow<Boolean> — operación de guardado (crear/editar horario o bloqueo) en curso
  const pending = ref(false)

  // Como StateFlow<String?> — id del horario cuyo toggle está en curso; null si ninguno
  const togglingId = ref<string | null>(null)

  // Como StateFlow<String?> — id del slot bloqueado que se está eliminando; null si ninguno
  const deletingSlotId = ref<string | null>(null)

  // Como StateFlow<String?> — id del horario en modo edición; null si se está creando uno nuevo
  const editingId = ref<string | null>(null)

  // Como StateFlow<String?> — mensaje de error, expuesto read-only a la UI
  const errorMessage = ref<string | null>(null)

  // Como StateFlow<String?> — mensaje de éxito tras una operación
  const successMessage = ref<string | null>(null)

  // Como MutableStateFlow<AvailabilityFormState> — estado del formulario de horario
  const form = reactive(createInitialForm())

  // Como MutableStateFlow<BlockFormState> — estado del formulario de bloqueo de slot
  const blockForm = reactive(createBlockForm())

  // Como derivedStateOf { } — permiso calculado desde el rol del usuario
  const canManageAvailability = computed(() => sessionRole.value === 'admin_doctor')
  const weekdaysList = weekdays

  // Equivale a fun loadAvailability() — carga paralela de disponibilidades y contexto de sesión
  const loadAvailability = async () => {
    loading.value = true
    errorMessage.value = null

    try {
      const [avail, session] = await Promise.all([
        dependencies.listAvailabilityUseCase.execute(),
        dependencies.getSessionContext.execute(),
      ])

      availabilities.value = avail
      sessionRole.value = session.role
      blockedSlots.value = []
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
    form.weekday = avail.weekday
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

  // Equivale a fun onSubmitAvailability() — crea o edita un horario según editingId
  const submitAvailability = async () => {
    pending.value = true
    errorMessage.value = null
    successMessage.value = null

    try {
      if (editingId.value) {
        await dependencies.updateAvailabilityUseCase.execute({
          id: editingId.value,
          weekday: form.weekday,
          startTime: form.startTime,
          endTime: form.endTime,
          isActive: form.isActive,
        })

        cancelEditingAvailability()
        successMessage.value = 'Horario actualizado correctamente.'
      } else {
        await dependencies.createAvailabilityUseCase.execute({
          weekday: form.weekday,
          startTime: form.startTime,
          endTime: form.endTime,
          isActive: form.isActive,
        })

        Object.assign(form, createInitialForm())
        successMessage.value = 'Horario registrado correctamente.'
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
      const date = blockForm.date
      const startsAt = parseAppDateTime(`${date}T${blockForm.startTime}:00`).toISOString()
      const endsAt = parseAppDateTime(`${date}T${blockForm.endTime}:00`).toISOString()

      await dependencies.createBlockedSlotUseCase.execute({
        startsAt,
        endsAt,
        reason: blockForm.reason.trim() || null,
      })

      Object.assign(blockForm, { ...createBlockForm(), date: blockForm.date })
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
    submitAvailability,
    toggleAvailabilityActive,
    submitBlockedSlot,
    deleteBlockedSlot,
  }
}
