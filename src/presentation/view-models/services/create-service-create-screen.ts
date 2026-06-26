import { reactive, ref } from 'vue'
import type { MedicalService } from '../../../domain/entities/medical-service'
import type { ServiceMutationInput } from '../../../application/dto/service-management'
import { createInitialServiceForm, normalizeOptionalPrice, type ServiceScreenPort } from './service-screen.types'

export interface ServiceCreateScreenDependencies {
  createServiceUseCase: ServiceScreenPort<ServiceMutationInput, MedicalService>
}

export const createServiceCreateScreen = (dependencies: ServiceCreateScreenDependencies) => {
  const pending = ref(false)
  const errorMessage = ref<string | null>(null)
  const successMessage = ref<string | null>(null)
  const createdService = ref<MedicalService | null>(null)

  const form = reactive(createInitialServiceForm())

  const submitService = async () => {
    pending.value = true
    errorMessage.value = null
    successMessage.value = null

    try {
      createdService.value = await dependencies.createServiceUseCase.execute({
        name: form.name,
        description: form.description.trim() || null,
        defaultDurationMinutes: form.defaultDurationMinutes,
        price: normalizeOptionalPrice(form.price),
        isActive: form.isActive,
      })

      Object.assign(form, createInitialServiceForm())
      successMessage.value = 'Servicio registrado correctamente.'
    } catch (error) {
      errorMessage.value =
        error && typeof error === 'object' && 'statusMessage' in error && typeof error.statusMessage === 'string'
          ? error.statusMessage
          : 'No se pudo registrar el servicio.'
    } finally {
      pending.value = false
    }
  }

  return {
    form,
    pending,
    errorMessage,
    successMessage,
    createdService,
    submitService,
  }
}
