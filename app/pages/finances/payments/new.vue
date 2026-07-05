<script setup lang="ts">
import { ref, reactive } from 'vue'
import { financeServiceLocator } from '~~/src/infrastructure/finances/service-locator'
import type { PaymentMethod } from '~~/src/domain/entities/payment'

definePageMeta({
  middleware: 'auth',
})

const router = useRouter()

const loading = ref(false)
const errorMessage = ref<string | null>(null)

const form = reactive({
  concept: '',
  amount: '' as string | number,
  method: 'efectivo' as PaymentMethod,
  paidAt: new Date().toISOString().slice(0, 10),
  notes: '',
})

const methodOptions: { label: string; value: PaymentMethod }[] = [
  { label: 'Efectivo', value: 'efectivo' },
  { label: 'Tarjeta', value: 'tarjeta' },
  { label: 'Transferencia', value: 'transferencia' },
]

const handleSubmit = async () => {
  loading.value = true
  errorMessage.value = null

  try {
    await financeServiceLocator.createPaymentUseCase.execute({
      concept: form.concept.trim(),
      amount: Number(form.amount),
      method: form.method,
      paidAt: new Date(form.paidAt).toISOString(),
      notes: form.notes.trim() || null,
    })

    await router.push('/finances/payments')
  } catch (error) {
    const msg =
      error && typeof error === 'object' && 'statusMessage' in error
        ? String((error as { statusMessage: string }).statusMessage)
        : 'Error al registrar el pago.'
    errorMessage.value = msg
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="new-payment-page">
    <div class="new-payment-header">
      <NuxtLink to="/finances/payments" class="new-payment-back">
        <UIcon name="i-heroicons-arrow-left-20-solid" />
      </NuxtLink>
      <h1 class="new-payment-title">Registrar pago</h1>
    </div>

    <form class="new-payment-form" @submit.prevent="handleSubmit">
      <p v-if="errorMessage" class="new-payment-error">{{ errorMessage }}</p>

      <div class="new-payment-field">
        <label class="new-payment-label" for="concept">Concepto</label>
        <input
          id="concept"
          v-model="form.concept"
          type="text"
          class="new-payment-input"
          placeholder="Ej. Consulta general"
          required
          maxlength="255"
        >
      </div>

      <div class="new-payment-row">
        <div class="new-payment-field">
          <label class="new-payment-label" for="amount">Monto (MXN)</label>
          <input
            id="amount"
            v-model.number="form.amount"
            type="number"
            class="new-payment-input"
            placeholder="0.00"
            step="0.01"
            min="0.01"
            required
          >
        </div>

        <div class="new-payment-field">
          <label class="new-payment-label" for="method">Método</label>
          <select id="method" v-model="form.method" class="new-payment-input">
            <option v-for="opt in methodOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>
      </div>

      <div class="new-payment-field">
        <label class="new-payment-label" for="paidAt">Fecha de pago</label>
        <input
          id="paidAt"
          v-model="form.paidAt"
          type="date"
          class="new-payment-input"
          required
        >
      </div>

      <div class="new-payment-field">
        <label class="new-payment-label" for="notes">Notas (opcional)</label>
        <textarea
          id="notes"
          v-model="form.notes"
          class="new-payment-input new-payment-textarea"
          placeholder="Observaciones adicionales..."
          maxlength="2000"
          rows="3"
        />
      </div>

      <div class="new-payment-actions">
        <NuxtLink to="/finances/payments" class="new-payment-cancel">
          Cancelar
        </NuxtLink>
        <button type="submit" class="new-payment-submit" :disabled="loading">
          {{ loading ? 'Guardando...' : 'Guardar pago' }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.new-payment-page {
  display: grid;
  gap: 1.5rem;
  max-width: 40rem;
}

.new-payment-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.new-payment-back {
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

.new-payment-back:hover {
  background: #edf7f5;
}

.new-payment-title {
  margin: 0;
  color: #132b2d;
  font-size: 1.8rem;
  font-weight: 800;
  letter-spacing: -0.04em;
}

.new-payment-form {
  display: grid;
  gap: 1.15rem;
  padding: 1.75rem;
  border-radius: 1.75rem;
  border: 1px solid #bfdedd;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 12px 32px rgba(20, 82, 76, 0.07);
}

.new-payment-error {
  margin: 0;
  border-radius: 0.9rem;
  padding: 0.85rem 1rem;
  background: #fff1f2;
  color: #b91c1c;
  font-size: 0.95rem;
  font-weight: 600;
}

.new-payment-field {
  display: grid;
  gap: 0.45rem;
}

.new-payment-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.new-payment-label {
  color: #305d63;
  font-size: 0.92rem;
  font-weight: 700;
}

.new-payment-input {
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

.new-payment-input:focus {
  border-color: #2a7371;
  background: white;
}

.new-payment-textarea {
  resize: vertical;
  font-family: inherit;
}

.new-payment-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 1rem;
  margin-top: 0.5rem;
}

.new-payment-cancel {
  color: #6f9a9d;
  font-size: 0.95rem;
  font-weight: 700;
}

.new-payment-submit {
  border-radius: 999px;
  padding: 0.85rem 2rem;
  background: #1b7676;
  color: white;
  font-size: 1rem;
  font-weight: 700;
  box-shadow: 0 8px 22px rgba(23, 95, 91, 0.18);
  transition: opacity 160ms ease, transform 160ms ease;
}

.new-payment-submit:disabled {
  opacity: 0.6;
}

.new-payment-submit:not(:disabled):hover {
  transform: translateY(-1px);
}

@media (max-width: 640px) {
  .new-payment-row {
    grid-template-columns: 1fr;
  }
}
</style>
