import { computed, reactive, ref } from 'vue'
import type { Assistant } from '../../../domain/entities/assistant'
import type {
  AssistantEmailCheckResult,
  AssistantMutationInput,
  AssistantScreenContextDto,
  AssistantUpdateInput,
} from '../../../application/dto/assistant-management'

export interface AssistantScreenPort<TInput, TResult> {
  execute(input: TInput): Promise<TResult>
}

export interface AssistantsScreenDependencies {
  listAssistantsUseCase: { execute(): Promise<Assistant[]> }
  checkAssistantEmailUseCase: { execute(email: string): Promise<AssistantEmailCheckResult> }
  createAssistantUseCase: AssistantScreenPort<AssistantMutationInput, Assistant>
  updateAssistantUseCase: AssistantScreenPort<AssistantUpdateInput, Assistant>
  deactivateAssistantUseCase: { execute(input: { userId: string }): Promise<Assistant> }
  reactivateAssistantUseCase: { execute(input: { userId: string }): Promise<Assistant> }
  deleteAssistantUseCase: { execute(input: { userId: string }): Promise<void> }
  getAssistantScreenContextUseCase: { execute(): Promise<AssistantScreenContextDto> }
}

const createInitialForm = () => ({
  name: '',
  email: '',
  password: '',
  phone: '',
  specialty: '',
})

const createEditForm = () => ({
  userId: '',
  name: '',
  phone: '',
  specialty: '',
})

const createReuseDialog = () => ({
  open: false,
  email: '',
  userId: '',
  name: '',
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
  const togglingUserId = ref<string | null>(null)
  const deletingUserId = ref<string | null>(null)
  const editingUserId = ref<string | null>(null)
  const errorMessage = ref<string | null>(null)
  const successMessage = ref<string | null>(null)

  const form = reactive(createInitialForm())
  const editForm = reactive(createEditForm())
  const reuseDialog = reactive(createReuseDialog())

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

  const closeReuseDialog = () => {
    Object.assign(reuseDialog, createReuseDialog())
  }

  const runAssistantCreation = async (reuseExistingUser: boolean) => {
    await dependencies.createAssistantUseCase.execute({
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      phone: normalizeOptionalText(form.phone),
      specialty: normalizeOptionalText(form.specialty),
      reuseExistingUser,
    })

    closeReuseDialog()
    Object.assign(form, createInitialForm())
    successMessage.value = reuseExistingUser
      ? 'Usuario huérfano reutilizado y vinculado correctamente.'
      : 'Asistente registrado correctamente.'
    await loadAssistants()
  }

  const submitAssistant = async () => {
    pending.value = true
    errorMessage.value = null
    successMessage.value = null

    try {
      const emailCheck = await dependencies.checkAssistantEmailUseCase.execute(form.email.trim().toLowerCase())

      if (emailCheck.status === 'orphan_reusable') {
        reuseDialog.open = true
        reuseDialog.email = emailCheck.email
        reuseDialog.userId = emailCheck.userId ?? ''
        reuseDialog.name = emailCheck.name ?? ''
        return
      }

      if (emailCheck.status === 'assistant_active') {
        errorMessage.value = 'Ese correo ya pertenece a un asistente activo.'
        return
      }

      if (emailCheck.status === 'assistant_inactive') {
        errorMessage.value = 'Ese correo ya existe como asistente inactivo. Usa "Vincular de nuevo".'
        return
      }

      if (emailCheck.status === 'existing_unavailable') {
        errorMessage.value = 'Ese correo ya existe en el sistema y no puede reutilizarse como asistente nuevo.'
        return
      }

      await runAssistantCreation(false)
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

  const confirmReuseAssistant = async () => {
    pending.value = true
    errorMessage.value = null
    successMessage.value = null

    try {
      await runAssistantCreation(true)
    } catch (error) {
      console.error('[assistants][reuse][client] request failed', {
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
          : 'No se pudo reutilizar el usuario existente.'
    } finally {
      pending.value = false
    }
  }

  const startEditingAssistant = (assistant: Assistant) => {
    editingUserId.value = assistant.userId
    editForm.userId = assistant.userId
    editForm.name = assistant.name
    editForm.phone = assistant.phone ?? ''
    editForm.specialty = assistant.specialty ?? ''
    errorMessage.value = null
    successMessage.value = null
  }

  const cancelEditingAssistant = () => {
    editingUserId.value = null
    Object.assign(editForm, createEditForm())
  }

  const submitAssistantUpdate = async () => {
    if (!editingUserId.value) {
      return
    }

    pending.value = true
    errorMessage.value = null
    successMessage.value = null

    try {
      await dependencies.updateAssistantUseCase.execute({
        userId: editForm.userId,
        name: editForm.name.trim(),
        phone: normalizeOptionalText(editForm.phone),
        specialty: normalizeOptionalText(editForm.specialty),
      })

      cancelEditingAssistant()
      successMessage.value = 'Asistente actualizado correctamente.'
      await loadAssistants()
    } catch (error) {
      console.error('[assistants][update][client] request failed', {
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
          : 'No se pudo actualizar el asistente.'
    } finally {
      pending.value = false
    }
  }

  const deactivateAssistant = async (userId: string) => {
    togglingUserId.value = userId
    errorMessage.value = null
    successMessage.value = null

    try {
      await dependencies.deactivateAssistantUseCase.execute({ userId })

      if (editingUserId.value === userId) {
        cancelEditingAssistant()
      }

      successMessage.value = 'Asistente desvinculado correctamente.'
      await loadAssistants()
    } catch (error) {
      console.error('[assistants][deactivate][client] request failed', {
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
          : 'No se pudo desvincular el asistente.'
    } finally {
      togglingUserId.value = null
    }
  }

  const reactivateAssistant = async (userId: string) => {
    togglingUserId.value = userId
    errorMessage.value = null
    successMessage.value = null

    try {
      await dependencies.reactivateAssistantUseCase.execute({ userId })
      successMessage.value = 'Asistente vinculado nuevamente.'
      await loadAssistants()
    } catch (error) {
      console.error('[assistants][reactivate][client] request failed', {
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
          : 'No se pudo vincular nuevamente al asistente.'
    } finally {
      togglingUserId.value = null
    }
  }

  const deleteAssistant = async (userId: string) => {
    deletingUserId.value = userId
    errorMessage.value = null
    successMessage.value = null

    try {
      await dependencies.deleteAssistantUseCase.execute({ userId })

      if (editingUserId.value === userId) {
        cancelEditingAssistant()
      }

      successMessage.value = 'Asistente eliminado definitivamente.'
      await loadAssistants()
    } catch (error) {
      console.error('[assistants][delete][client] request failed', {
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
          : 'No se pudo eliminar el asistente.'
    } finally {
      deletingUserId.value = null
    }
  }

  return {
    assistants,
    screenContext,
    form,
    editForm,
    reuseDialog,
    loading,
    contextLoading,
    pending,
    togglingUserId,
    deletingUserId,
    editingUserId,
    errorMessage,
    successMessage,
    canManageAssistants,
    assistantsCount,
    loadAssistants,
    loadScreenContext,
    submitAssistant,
    closeReuseDialog,
    confirmReuseAssistant,
    startEditingAssistant,
    cancelEditingAssistant,
    submitAssistantUpdate,
    deactivateAssistant,
    reactivateAssistant,
    deleteAssistant,
  }
}
