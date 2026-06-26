import { computed, ref } from 'vue'
import type { MedicalService } from '../../../domain/entities/medical-service'
import type { ServiceScreenContextDto } from '../../../application/dto/service-management'

export interface ServicesListScreenDependencies {
  listServicesUseCase: { execute(): Promise<MedicalService[]> }
  getServiceScreenContextUseCase: { execute(): Promise<ServiceScreenContextDto> }
}

export const createServicesListScreen = (dependencies: ServicesListScreenDependencies) => {
  const services = ref<MedicalService[]>([])
  const screenContext = ref<ServiceScreenContextDto | null>(null)
  const loading = ref(false)
  const errorMessage = ref<string | null>(null)

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
  const totalLabel = computed(() => `${services.value.length} servicios · ORL`)
  const emptyStateMessage = computed(() => 'Aún no hay servicios registrados.')

  return {
    services,
    screenContext,
    loading,
    errorMessage,
    canManageServices,
    totalLabel,
    emptyStateMessage,
    loadServices,
    loadScreenContext,
  }
}
