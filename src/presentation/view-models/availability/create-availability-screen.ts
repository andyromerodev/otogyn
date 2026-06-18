import { computed, reactive, ref } from 'vue'
import type { BlockedTimeSlot } from '../../../domain/entities/blocked-time-slot'
import type { DoctorAvailability } from '../../../domain/entities/doctor-availability'
import type { AvailabilityMutationInput, BlockedSlotMutationInput, AvailabilityUpdateInput } from '../../../application/dto/availability-management'

export interface AvailabilityScreenPort<TInput, TResult> {
  execute(input: TInput): Promise<TResult>
}

export interface AvailabilityScreenDependencies {
  listAvailabilityUseCase: { execute(): Promise<DoctorAvailability[]> }
  createAvailabilityUseCase: AvailabilityScreenPort<AvailabilityMutationInput, DoctorAvailability>
  updateAvailabilityUseCase: AvailabilityScreenPort<AvailabilityUpdateInput, DoctorAvailability>
  toggleAvailabilityActiveUseCase: { execute(id: string): Promise<DoctorAvailability> }
  createBlockedSlotUseCase: AvailabilityScreenPort<BlockedSlotMutationInput, BlockedTimeSlot>
  deleteBlockedSlotUseCase: { execute(id: string): Promise<void> }
  getSessionContext: { execute(): Promise<{ role: 'admin_doctor' | 'assistant' }> }
}

const createInitialForm = () => ({
  weekday: 1,
  startTime: '09:00',
  endTime: '18:00',
  isActive: true,
})

const createBlockForm = () => ({
  date: new Date().toISOString().slice(0, 10),
  startTime: '13:00',
  endTime: '14:00',
  reason: '',
})

const weekdays = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado']

export const createAvailabilityScreen = (dependencies: AvailabilityScreenDependencies) => {
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
      const startsAt = new Date(`${date}T${blockForm.startTime}:00`).toISOString()
      const endsAt = new Date(`${date}T${blockForm.endTime}:00`).toISOString()

      await dependencies.createBlockedSlotUseCase.execute({
        startsAt,
        endsAt,
        reason: blockForm.reason.trim() || null,
      })

      Object.assign(blockForm, {
        ...createBlockForm(),
        date: blockForm.date,
      })

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
