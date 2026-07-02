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

  const page = ref(Math.max(dependencies.initialPage ?? 1, 1))
  const pageSize = ref(Math.max(dependencies.initialPageSize ?? 10, 1))

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
  const total = computed(() => services.value.length)
  const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))
  const hasNext = computed(() => page.value < totalPages.value)
  const hasPrevious = computed(() => page.value > 1)
  const paginatedServices = computed(() => {
    const start = (page.value - 1) * pageSize.value
    return services.value.slice(start, start + pageSize.value)
  })
  const emptyStateMessage = computed(() => 'Aún no hay servicios registrados.')

  const goToPage = (nextPage: number) => {
    if (nextPage === page.value || nextPage < 1 || nextPage > totalPages.value) return
    page.value = nextPage
  }

  const goToNextPage = () => { if (hasNext.value) goToPage(page.value + 1) }
  const goToPreviousPage = () => { if (hasPrevious.value) goToPage(page.value - 1) }

  return {
    services,
    paginatedServices,
    screenContext,
    loading,
    errorMessage,
    page,
    pageSize,
    total,
    totalPages,
    hasNext,
    hasPrevious,
    canManageServices,
    totalLabel,
    emptyStateMessage,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    loadServices,
    loadScreenContext,
  }
}
