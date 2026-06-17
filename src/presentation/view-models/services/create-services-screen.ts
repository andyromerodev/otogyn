import { computed, reactive, ref } from 'vue'
import type { MedicalService } from '../../../domain/entities/medical-service'
import type {
  ServiceMutationInput,
  ServiceScreenContextDto,
  ServiceUpdateInput,
} from '../../../application/dto/service-management'

export interface ServiceScreenPort<TInput, TResult> {
  execute(input: TInput): Promise<TResult>
}

export interface ServicesScreenDependencies {
  listServicesUseCase: { execute(): Promise<MedicalService[]> }
  createServiceUseCase: ServiceScreenPort<ServiceMutationInput, MedicalService>
  updateServiceUseCase: ServiceScreenPort<ServiceUpdateInput, MedicalService>
  getServiceScreenContextUseCase: { execute(): Promise<ServiceScreenContextDto> }
}

const createInitialForm = () => ({
  name: '',
  description: '',
  defaultDurationMinutes: 30,
  price: '',
  isActive: true,
})

const createEditForm = () => ({
  id: '',
  name: '',
  description: '',
  defaultDurationMinutes: 30,
  price: '',
  isActive: true,
})

const normalizeOptionalPrice = (value: string | number) => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null
  }

  const normalized = value.trim()

  if (!normalized) {
    return null
  }

  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

export const createServicesScreen = (dependencies: ServicesScreenDependencies) => {
  const services = ref<MedicalService[]>([])
  const screenContext = ref<ServiceScreenContextDto | null>(null)
  const loading = ref(false)
  const contextLoading = ref(false)
  const pending = ref(false)
  const togglingServiceId = ref<string | null>(null)
  const editingServiceId = ref<string | null>(null)
  const errorMessage = ref<string | null>(null)
  const successMessage = ref<string | null>(null)

  const form = reactive(createInitialForm())
  const editForm = reactive(createEditForm())

  const canCreateServices = computed(() => screenContext.value?.role === 'admin_doctor')

  const loadServices = async () => {
    loading.value = true
    errorMessage.value = null

    try {
      services.value = await dependencies.listServicesUseCase.execute()
    } catch (error) {
      errorMessage.value =
        error && typeof error === 'object' && 'statusMessage' in error && typeof error.statusMessage === 'string'
          ? error.statusMessage
          : 'No se pudo cargar el catalogo de servicios.'
    } finally {
      loading.value = false
    }
  }

  const loadScreenContext = async () => {
    contextLoading.value = true

    try {
      screenContext.value = await dependencies.getServiceScreenContextUseCase.execute()
    } catch (error) {
      errorMessage.value =
        error && typeof error === 'object' && 'statusMessage' in error && typeof error.statusMessage === 'string'
          ? error.statusMessage
          : 'No se pudo cargar el contexto del usuario.'
    } finally {
      contextLoading.value = false
    }
  }

  const submitService = async () => {
    pending.value = true
    errorMessage.value = null
    successMessage.value = null

    try {
      await dependencies.createServiceUseCase.execute({
        name: form.name,
        description: form.description.trim() || null,
        defaultDurationMinutes: form.defaultDurationMinutes,
        price: normalizeOptionalPrice(form.price),
        isActive: form.isActive,
      })

      Object.assign(form, createInitialForm())
      successMessage.value = 'Servicio registrado correctamente.'
      await loadServices()
    } catch (error) {
      console.error('[services][create][client] request failed', {
        error,
        statusCode:
          error && typeof error === 'object' && 'statusCode' in error && typeof error.statusCode === 'number'
            ? error.statusCode
            : undefined,
        statusMessage:
          error && typeof error === 'object' && 'statusMessage' in error && typeof error.statusMessage === 'string'
            ? error.statusMessage
            : undefined,
        data:
          error && typeof error === 'object' && 'data' in error
            ? error.data
            : undefined,
      })

      errorMessage.value =
        error && typeof error === 'object' && 'statusMessage' in error && typeof error.statusMessage === 'string'
          ? error.statusMessage
          : 'No se pudo registrar el servicio.'
    } finally {
      pending.value = false
    }
  }

  const startEditingService = (service: MedicalService) => {
    editingServiceId.value = service.id
    editForm.id = service.id
    editForm.name = service.name
    editForm.description = service.description ?? ''
    editForm.defaultDurationMinutes = service.defaultDurationMinutes
    editForm.price = service.price === null ? '' : String(service.price)
    editForm.isActive = service.isActive
    errorMessage.value = null
    successMessage.value = null
  }

  const cancelEditingService = () => {
    editingServiceId.value = null
    Object.assign(editForm, createEditForm())
  }

  const submitServiceUpdate = async () => {
    if (!editingServiceId.value) {
      return
    }

    pending.value = true
    errorMessage.value = null
    successMessage.value = null

    try {
      await dependencies.updateServiceUseCase.execute({
        id: editForm.id,
        name: editForm.name.trim(),
        description: editForm.description.trim() || null,
        defaultDurationMinutes: editForm.defaultDurationMinutes,
        price: normalizeOptionalPrice(editForm.price),
        isActive: editForm.isActive,
      })

      cancelEditingService()
      successMessage.value = 'Servicio actualizado correctamente.'
      await loadServices()
    } catch (error) {
      console.error('[services][update][client] request failed', {
        error,
        statusCode:
          error && typeof error === 'object' && 'statusCode' in error && typeof error.statusCode === 'number'
            ? error.statusCode
            : undefined,
        statusMessage:
          error && typeof error === 'object' && 'statusMessage' in error && typeof error.statusMessage === 'string'
            ? error.statusMessage
            : undefined,
        data:
          error && typeof error === 'object' && 'data' in error
            ? error.data
            : undefined,
      })

      errorMessage.value =
        error && typeof error === 'object' && 'statusMessage' in error && typeof error.statusMessage === 'string'
          ? error.statusMessage
          : 'No se pudo actualizar el servicio.'
    } finally {
      pending.value = false
    }
  }

  const toggleServiceActive = async (serviceId: string) => {
    const service = services.value.find((s) => s.id === serviceId)

    if (!service) {
      return
    }

    togglingServiceId.value = serviceId
    errorMessage.value = null
    successMessage.value = null

    const nextActive = !service.isActive

    try {
      await dependencies.updateServiceUseCase.execute({
        id: serviceId,
        isActive: nextActive,
      })

      if (editingServiceId.value === serviceId) {
        cancelEditingService()
      }

      successMessage.value = nextActive
        ? 'Servicio activado correctamente.'
        : 'Servicio desactivado correctamente.'
      await loadServices()
    } catch (error) {
      console.error('[services][toggle][client] request failed', {
        error,
        statusCode:
          error && typeof error === 'object' && 'statusCode' in error && typeof error.statusCode === 'number'
            ? error.statusCode
            : undefined,
        statusMessage:
          error && typeof error === 'object' && 'statusMessage' in error && typeof error.statusMessage === 'string'
            ? error.statusMessage
            : undefined,
      })

      errorMessage.value =
        error && typeof error === 'object' && 'statusMessage' in error && typeof error.statusMessage === 'string'
          ? error.statusMessage
          : 'No se pudo cambiar el estado del servicio.'
    } finally {
      togglingServiceId.value = null
    }
  }

  return {
    services,
    screenContext,
    form,
    editForm,
    loading,
    contextLoading,
    pending,
    togglingServiceId,
    editingServiceId,
    errorMessage,
    successMessage,
    canCreateServices,
    loadServices,
    loadScreenContext,
    submitService,
    startEditingService,
    cancelEditingService,
    submitServiceUpdate,
    toggleServiceActive,
  }
}
