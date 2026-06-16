import { computed, reactive, ref } from 'vue'
import type { Assistant } from '../../../domain/entities/assistant'
import type {
  AssistantMutationInput,
  AssistantScreenContextDto,
} from '../../../application/dto/assistant-management'

export interface AssistantScreenPort<TInput, TResult> {
  execute(input: TInput): Promise<TResult>
}

export interface AssistantsScreenDependencies {
  listAssistantsUseCase: { execute(): Promise<Assistant[]> }
  createAssistantUseCase: AssistantScreenPort<AssistantMutationInput, Assistant>
  getAssistantScreenContextUseCase: { execute(): Promise<AssistantScreenContextDto> }
}

const createInitialForm = () => ({
  name: '',
  email: '',
  password: '',
  phone: '',
  specialty: '',
})

const normalizeOptionalText = (value: string) => {
  const normalized = value.trim()
  return normalized ? normalized : null
}

export const createAssistantsScreen = (dependencies: AssistantsScreenDependencies) => {
  const assistants = ref<Assistant[]>([])
  const screenContext = ref<AssistantScreenContextDto | null>(null)
  const loading = ref(false)
  const contextLoading = ref(false)
  const pending = ref(false)
  const errorMessage = ref<string | null>(null)
  const successMessage = ref<string | null>(null)

  const form = reactive(createInitialForm())

  const canManageAssistants = computed(() => screenContext.value?.role === 'admin_doctor')
  const assistantsCount = computed(() => assistants.value.length)

  const loadAssistants = async () => {
    loading.value = true
    errorMessage.value = null

    try {
      assistants.value = await dependencies.listAssistantsUseCase.execute()
    } catch (error) {
      errorMessage.value =
        error && typeof error === 'object' && 'statusMessage' in error && typeof error.statusMessage === 'string'
          ? error.statusMessage
          : 'No se pudo cargar la lista de asistentes.'
    } finally {
      loading.value = false
    }
  }

  const loadScreenContext = async () => {
    contextLoading.value = true

    try {
      screenContext.value = await dependencies.getAssistantScreenContextUseCase.execute()
    } catch (error) {
      errorMessage.value =
        error && typeof error === 'object' && 'statusMessage' in error && typeof error.statusMessage === 'string'
          ? error.statusMessage
          : 'No se pudo cargar el contexto del usuario.'
    } finally {
      contextLoading.value = false
    }
  }

  const submitAssistant = async () => {
    pending.value = true
    errorMessage.value = null
    successMessage.value = null

    try {
      await dependencies.createAssistantUseCase.execute({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        phone: normalizeOptionalText(form.phone),
        specialty: normalizeOptionalText(form.specialty),
      })

      Object.assign(form, createInitialForm())
      successMessage.value = 'Asistente registrado correctamente.'
      await loadAssistants()
    } catch (error) {
      console.error('[assistants][create][client] request failed', {
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
          : 'No se pudo registrar el asistente.'
    } finally {
      pending.value = false
    }
  }

  return {
    assistants,
    screenContext,
    form,
    loading,
    contextLoading,
    pending,
    errorMessage,
    successMessage,
    canManageAssistants,
    assistantsCount,
    loadAssistants,
    loadScreenContext,
    submitAssistant,
  }
}
