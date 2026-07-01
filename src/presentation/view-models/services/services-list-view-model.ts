import { computed, ref } from 'vue'
import type { MedicalService } from '../../../domain/entities/medical-service'
import type { ServiceScreenContextDto } from '../../../application/dto/service-management'
import type { ServicesListViewModelDependencies } from './services-list-view-model.module'

export type { ServicesListViewModelDependencies } from './services-list-view-model.module'

// Factory del ViewModel — equivale al constructor de ServicesListViewModel : ViewModel()
export const createServicesListViewModel = (dependencies: ServicesListViewModelDependencies) => {
  // Como StateFlow<List<MedicalService>> — lista vacía como estado inicial
  const services = ref<MedicalService[]>([])

  // Como StateFlow<ServiceScreenContextDto?> — contexto del usuario (rol, permisos)
  const screenContext = ref<ServiceScreenContextDto | null>(null)

  // Como StateFlow<Boolean> — la UI lo observa para mostrar el skeleton/placeholder
  const loading = ref(false)

  // Como StateFlow<String?> — expuesto read-only a la UI; solo el ViewModel lo muta via .value
  const errorMessage = ref<string | null>(null)

  // Equivale a fun loadServices() — dispara el UseCase y actualiza los StateFlows
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

  // Como derivedStateOf { } — valores calculados y cacheados desde los StateFlows base
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
