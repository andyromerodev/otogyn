import { ref, reactive } from 'vue'
import type { ExpenseCategory } from '~~/src/domain/entities/expense-category'
import type { ExpenseCategoriesViewModelDependencies } from './expense-categories-view-model.module'

export type { ExpenseCategoriesViewModelDependencies } from './expense-categories-view-model.module'

const resolveError = (error: unknown): string => {
  const msg =
    error && typeof error === 'object' && 'statusMessage' in error
      ? String((error as { statusMessage: string }).statusMessage)
      : null

  return msg ?? 'Ocurrió un error inesperado.'
}

export const createExpenseCategoriesViewModel = (deps: ExpenseCategoriesViewModelDependencies) => {
  const categories = ref<ExpenseCategory[]>([])
  const loading = ref(false)
  const errorMessage = ref<string | null>(null)

  // Create form state
  const showCreateForm = ref(false)
  const createForm = reactive({ name: '' })
  const createLoading = ref(false)
  const createError = ref<string | null>(null)

  // Inline edit state
  const editingId = ref<string | null>(null)
  const editForm = reactive({ name: '' })
  const editLoading = ref(false)
  const editError = ref<string | null>(null)

  const loadCategories = async (includeInactive = false) => {
    loading.value = true
    errorMessage.value = null

    try {
      categories.value = await deps.listCategoriesUseCase.execute({ includeInactive })
    } catch (error) {
      errorMessage.value = resolveError(error)
    } finally {
      loading.value = false
    }
  }

  const openCreateForm = () => {
    createForm.name = ''
    createError.value = null
    showCreateForm.value = true
  }

  const closeCreateForm = () => {
    showCreateForm.value = false
  }

  const submitCreate = async () => {
    const name = createForm.name.trim()

    if (!name) {
      createError.value = 'El nombre es obligatorio.'
      return
    }

    createLoading.value = true
    createError.value = null

    try {
      const created = await deps.createCategoryUseCase.execute({ name })
      categories.value = [...categories.value, created]
      showCreateForm.value = false
      createForm.name = ''
    } catch (error) {
      createError.value = resolveError(error)
    } finally {
      createLoading.value = false
    }
  }

  const startEdit = (category: ExpenseCategory) => {
    editingId.value = category.id
    editForm.name = category.name
    editError.value = null
  }

  const cancelEdit = () => {
    editingId.value = null
    editError.value = null
  }

  const submitEdit = async () => {
    if (!editingId.value) return

    const name = editForm.name.trim()

    if (!name) {
      editError.value = 'El nombre es obligatorio.'
      return
    }

    editLoading.value = true
    editError.value = null

    try {
      const updated = await deps.updateCategoryUseCase.execute(editingId.value, { name })
      categories.value = categories.value.map((c) => (c.id === updated.id ? updated : c))
      editingId.value = null
    } catch (error) {
      editError.value = resolveError(error)
    } finally {
      editLoading.value = false
    }
  }

  const deactivate = async (categoryId: string) => {
    try {
      const updated = await deps.updateCategoryUseCase.execute(categoryId, { isActive: false })
      categories.value = categories.value.map((c) => (c.id === updated.id ? updated : c))
    } catch (error) {
      errorMessage.value = resolveError(error)
    }
  }

  const reactivate = async (categoryId: string) => {
    try {
      const updated = await deps.updateCategoryUseCase.execute(categoryId, { isActive: true })
      categories.value = categories.value.map((c) => (c.id === updated.id ? updated : c))
    } catch (error) {
      errorMessage.value = resolveError(error)
    }
  }

  return {
    categories,
    loading,
    errorMessage,
    showCreateForm,
    createForm,
    createLoading,
    createError,
    editingId,
    editForm,
    editLoading,
    editError,
    loadCategories,
    openCreateForm,
    closeCreateForm,
    submitCreate,
    startEdit,
    cancelEdit,
    submitEdit,
    deactivate,
    reactivate,
  }
}
