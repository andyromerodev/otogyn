<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { financeServiceLocator } from '~~/src/infrastructure/finances/service-locator'
import type { ExpenseCategory } from '~~/src/domain/entities/expense-category'

definePageMeta({
  middleware: 'auth',
})

const router = useRouter()

const loading = ref(false)
const errorMessage = ref<string | null>(null)
const categories = ref<ExpenseCategory[]>([])

const form = reactive({
  categoryId: '',
  description: '',
  amount: '' as string | number,
  expenseDate: new Date().toISOString().slice(0, 10),
  notes: '',
})

onMounted(async () => {
  try {
    categories.value = await financeServiceLocator.listCategoriesUseCase.execute()
    if (categories.value[0]) {
      form.categoryId = categories.value[0].id
    }
  } catch {
    errorMessage.value = 'No se pudieron cargar las categorías.'
  }
})

const handleSubmit = async () => {
  loading.value = true
  errorMessage.value = null

  try {
    await financeServiceLocator.createExpenseUseCase.execute({
      categoryId: form.categoryId,
      description: form.description.trim(),
      amount: Number(form.amount),
      expenseDate: new Date(form.expenseDate).toISOString(),
      notes: form.notes.trim() || null,
    })

    await router.push('/finances/expenses')
  } catch (error) {
    const msg =
      error && typeof error === 'object' && 'statusMessage' in error
        ? String((error as { statusMessage: string }).statusMessage)
        : 'Error al registrar el gasto.'
    errorMessage.value = msg
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="new-expense-page">
    <div class="new-expense-header">
      <NuxtLink to="/finances/expenses" class="new-expense-back">
        <UIcon name="i-heroicons-arrow-left-20-solid" />
      </NuxtLink>
      <h1 class="new-expense-title">Registrar gasto</h1>
    </div>

    <form class="new-expense-form" @submit.prevent="handleSubmit">
      <p v-if="errorMessage" class="new-expense-error">{{ errorMessage }}</p>

      <div class="new-expense-field">
        <label class="new-expense-label" for="categoryId">Categoría</label>
        <select id="categoryId" v-model="form.categoryId" class="new-expense-input" required>
          <option value="" disabled>Selecciona una categoría</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>
        <NuxtLink to="/finances/categories" class="new-expense-categories-link">
          + Gestionar categorías
        </NuxtLink>
      </div>

      <div class="new-expense-field">
        <label class="new-expense-label" for="description">Descripción</label>
        <input
          id="description"
          v-model="form.description"
          type="text"
          class="new-expense-input"
          placeholder="Ej. Compra de guantes de látex"
          required
          maxlength="255"
        >
      </div>

      <div class="new-expense-row">
        <div class="new-expense-field">
          <label class="new-expense-label" for="amount">Monto (MXN)</label>
          <input
            id="amount"
            v-model.number="form.amount"
            type="number"
            class="new-expense-input"
            placeholder="0.00"
            step="0.01"
            min="0.01"
            required
          >
        </div>

        <div class="new-expense-field">
          <label class="new-expense-label" for="expenseDate">Fecha</label>
          <input
            id="expenseDate"
            v-model="form.expenseDate"
            type="date"
            class="new-expense-input"
            required
          >
        </div>
      </div>

      <div class="new-expense-field">
        <label class="new-expense-label" for="notes">Notas (opcional)</label>
        <textarea
          id="notes"
          v-model="form.notes"
          class="new-expense-input new-expense-textarea"
          placeholder="Observaciones adicionales..."
          maxlength="2000"
          rows="3"
        />
      </div>

      <div class="new-expense-actions">
        <NuxtLink to="/finances/expenses" class="new-expense-cancel">
          Cancelar
        </NuxtLink>
        <button type="submit" class="new-expense-submit" :disabled="loading">
          {{ loading ? 'Guardando...' : 'Guardar gasto' }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.new-expense-page {
  display: grid;
  gap: 1.5rem;
  max-width: 40rem;
}

.new-expense-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.new-expense-back {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.6rem;
  height: 2.6rem;
  border-radius: 999px;
  border: 1px solid #d4ebe8;
  color: #305d63;
  font-size: 1.25rem;
  transition: background-color 160ms ease;
}

.new-expense-back:hover {
  background: #edf7f5;
}

.new-expense-title {
  margin: 0;
  color: #132b2d;
  font-size: 1.8rem;
  font-weight: 800;
  letter-spacing: -0.04em;
}

.new-expense-form {
  display: grid;
  gap: 1.15rem;
  padding: 1.75rem;
  border-radius: 1.75rem;
  border: 1px solid #bfdedd;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 12px 32px rgba(20, 82, 76, 0.07);
}

.new-expense-error {
  margin: 0;
  border-radius: 0.9rem;
  padding: 0.85rem 1rem;
  background: #fff1f2;
  color: #b91c1c;
  font-size: 0.95rem;
  font-weight: 600;
}

.new-expense-field {
  display: grid;
  gap: 0.45rem;
}

.new-expense-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.new-expense-label {
  color: #305d63;
  font-size: 0.92rem;
  font-weight: 700;
}

.new-expense-input {
  border: 1.5px solid #bddfdf;
  border-radius: 0.9rem;
  padding: 0.85rem 1rem;
  background: #f9fdfc;
  color: #132b2d;
  font-size: 1rem;
  outline: none;
  transition: border-color 160ms ease;
  width: 100%;
  box-sizing: border-box;
}

.new-expense-input:focus {
  border-color: #2a7371;
  background: white;
}

.new-expense-textarea {
  resize: vertical;
  font-family: inherit;
}

.new-expense-categories-link {
  color: #2a7371;
  font-size: 0.88rem;
  font-weight: 700;
}

.new-expense-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 1rem;
  margin-top: 0.5rem;
}

.new-expense-cancel {
  color: #6f9a9d;
  font-size: 0.95rem;
  font-weight: 700;
}

.new-expense-submit {
  border-radius: 999px;
  padding: 0.85rem 2rem;
  background: #1b7676;
  color: white;
  font-size: 1rem;
  font-weight: 700;
  box-shadow: 0 8px 22px rgba(23, 95, 91, 0.18);
  transition: opacity 160ms ease, transform 160ms ease;
}

.new-expense-submit:disabled {
  opacity: 0.6;
}

.new-expense-submit:not(:disabled):hover {
  transform: translateY(-1px);
}

@media (max-width: 640px) {
  .new-expense-row {
    grid-template-columns: 1fr;
  }
}
</style>
