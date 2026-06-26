import { computed, reactive, ref } from 'vue'
import type { MedicalService } from '../../../domain/entities/medical-service'
import type {
  ServiceDeleteInput,
  ServiceDetailInput,
  ServiceScreenContextDto,
  ServiceUpdateInput,
} from '../../../application/dto/service-management'
import { createInitialServiceForm, normalizeOptionalPrice, type ServiceScreenPort } from './service-screen.types'

export interface ServiceDetailScreenDependencies {
  serviceId: string
  getServiceDetailUseCase: { execute(input: ServiceDetailInput): Promise<MedicalService> }
  updateServiceUseCase: ServiceScreenPort<ServiceUpdateInput, MedicalService>
  deleteServiceUseCase: ServiceScreenPort<ServiceDeleteInput, void>
  getServiceScreenContextUseCase: { execute(): Promise<ServiceScreenContextDto> }
}

export const createServiceDetailScreen = (dependencies: ServiceDetailScreenDependencies) => {
  const service = ref<MedicalService | null>(null)
  const screenContext = ref<ServiceScreenContextDto | null>(null)
  const loading = ref(false)
  const pending = ref(false)
  const deletePending = ref(false)
  const errorMessage = ref<string | null>(null)
  const successMessage = ref<string | null>(null)
  const isEditing = ref(false)
  const isDeleteConfirmOpen = ref(false)
  const isDeleteBlockedDialogOpen = ref(false)
  const deleteBlockedMessage = ref<string | null>(null)
  const deleted = ref(false)
  const form = reactive(createInitialServiceForm())

  const syncForm = (value: MedicalService) => {
    form.name = value.name
    form.description = value.description ?? ''
    form.defaultDurationMinutes = value.defaultDurationMinutes
    form.price = value.price === null ? '' : String(value.price)
    form.isActive = value.isActive
  }

  const loadService = async () => {
    loading.value = true
    errorMessage.value = null

    try {
      service.value = await dependencies.getServiceDetailUseCase.execute({
        serviceId: dependencies.serviceId,
      })
      syncForm(service.value)
    } catch (error) {
      errorMessage.value =
        error && typeof error === 'object' && 'statusMessage' in error && typeof error.statusMessage === 'string'
          ? error.statusMessage
          : 'No se pudo cargar el servicio.'
    } finally {
      loading.value = false
    }
  }

  const submitService = async () => {
    pending.value = true
    errorMessage.value = null
    successMessage.value = null

    try {
      service.value = await dependencies.updateServiceUseCase.execute({
        id: dependencies.serviceId,
        name: form.name.trim(),
        description: form.description.trim() || null,
        defaultDurationMinutes: form.defaultDurationMinutes,
        price: normalizeOptionalPrice(form.price),
        isActive: form.isActive,
      })

      if (service.value) {
        syncForm(service.value)
      }

      successMessage.value = 'Servicio actualizado correctamente.'
      isEditing.value = false
    } catch (error) {
      errorMessage.value =
        error && typeof error === 'object' && 'statusMessage' in error && typeof error.statusMessage === 'string'
          ? error.statusMessage
          : 'No se pudo actualizar el servicio.'
    } finally {
      pending.value = false
    }
  }

  const requestDelete = () => {
    isDeleteConfirmOpen.value = true
    isDeleteBlockedDialogOpen.value = false
    deleteBlockedMessage.value = null
    errorMessage.value = null
    successMessage.value = null
  }

  const cancelDelete = () => {
    isDeleteConfirmOpen.value = false
  }

  const closeDeleteBlockedDialog = () => {
    isDeleteBlockedDialogOpen.value = false
    deleteBlockedMessage.value = null
  }

  const confirmDelete = async () => {
    deletePending.value = true
    errorMessage.value = null
    successMessage.value = null

    try {
      await dependencies.deleteServiceUseCase.execute({
        serviceId: dependencies.serviceId,
      })
      deleted.value = true
      isDeleteConfirmOpen.value = false
    } catch (error) {
      const message =
        error && typeof error === 'object' && 'statusMessage' in error && typeof error.statusMessage === 'string'
          ? error.statusMessage
          : 'No se pudo eliminar el servicio.'

      if (message === 'No se puede eliminar un servicio con citas asociadas.') {
        isDeleteConfirmOpen.value = false
        isDeleteBlockedDialogOpen.value = true
        deleteBlockedMessage.value = message
      } else {
        errorMessage.value = message
      }
    } finally {
      deletePending.value = false
    }
  }

  const loadScreenContext = async () => {
    try {
      screenContext.value = await dependencies.getServiceScreenContextUseCase.execute()
    } catch (error) {
      errorMessage.value =
        error && typeof error === 'object' && 'statusMessage' in error && typeof error.statusMessage === 'string'
          ? error.statusMessage
          : 'No se pudo cargar el contexto del usuario.'
    }
  }

  const canManageServices = computed(() => screenContext.value?.role === 'admin_doctor')

  const startEditing = () => {
    isEditing.value = true
    errorMessage.value = null
    successMessage.value = null
  }

  const cancelEditing = () => {
    if (service.value) {
      syncForm(service.value)
    }

    isEditing.value = false
    errorMessage.value = null
    successMessage.value = null
  }

  return {
    service,
    screenContext,
    form,
    loading,
    pending,
    deletePending,
    errorMessage,
    successMessage,
    isEditing,
    isDeleteConfirmOpen,
    isDeleteBlockedDialogOpen,
    deleteBlockedMessage,
    deleted,
    canManageServices,
    loadService,
    loadScreenContext,
    startEditing,
    cancelEditing,
    submitService,
    requestDelete,
    cancelDelete,
    closeDeleteBlockedDialog,
    confirmDelete,
  }
}
