import { reactive, ref } from 'vue'
import type { MedicalService } from '../../../domain/entities/medical-service'
import { createInitialServiceForm, normalizeOptionalPrice } from './service-view-model.types'
import type { ServiceCreateViewModelDependencies } from './service-create-view-model.module'

export type { ServiceCreateViewModelDependencies } from './service-create-view-model.module'

// Factory del ViewModel — equivale al constructor de ServiceCreateViewModel : ViewModel()
export const createServiceCreateViewModel = (dependencies: ServiceCreateViewModelDependencies) => {
  // Como StateFlow<Boolean> — la UI lo observa para deshabilitar el botón de submit
  const pending = ref(false)

  // Como StateFlow<String?> — mensaje de error, expuesto read-only a la UI
  const errorMessage = ref<string | null>(null)

  // Como StateFlow<String?> — mensaje de éxito tras registrar el servicio
  const successMessage = ref<string | null>(null)

  // Como StateFlow<MedicalService?> — servicio recién creado, null hasta que el submit tiene éxito
  const createdService = ref<MedicalService | null>(null)

  // Como MutableStateFlow<ServiceFormState> — estado mutable del formulario,
  // se resetea a valores por defecto tras un registro exitoso
  const form = reactive(createInitialServiceForm())

  // Equivale a fun onSubmitService() — lanza el UseCase y actualiza los StateFlows
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
