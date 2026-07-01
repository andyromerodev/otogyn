<script setup lang="ts">
import { useServiceCreateViewModel } from '../../composables/services/use-service-create-view-model'

definePageMeta({
  middleware: 'auth',
})

const viewModel = useServiceCreateViewModel()

const handleSubmit = async () => {
  await viewModel.submitService()

  if (viewModel.createdService.value) {
    await navigateTo('/services')
  }
}
</script>

<template>
  <div class="service-create-page">
    <div class="service-create-header">
      <NuxtLink to="/services" class="service-create-back">
        <UIcon name="i-heroicons-arrow-left-20-solid" />
        <span>Volver a servicios</span>
      </NuxtLink>

      <div>
        <p class="service-create-eyebrow">Servicios</p>
        <h1 class="service-create-title">Nuevo servicio</h1>
        <p class="service-create-copy">Duracion, precio opcional y estado activo.</p>
      </div>
    </div>

    <article class="surface-card service-create-card">
      <form class="service-create-form" @submit.prevent="handleSubmit">
        <label class="service-field">
          <span>Nombre</span>
          <input v-model="viewModel.form.name" type="text" placeholder="Consulta ORL" required>
        </label>

        <label class="service-field">
          <span>Descripcion</span>
          <textarea
            v-model="viewModel.form.description"
            rows="4"
            placeholder="Detalle administrativo del servicio."
          />
        </label>

        <div class="service-grid">
          <label class="service-field">
            <span>Duracion (min)</span>
            <input
              v-model.number="viewModel.form.defaultDurationMinutes"
              type="number"
              min="1"
              max="480"
              required
            >
          </label>

          <label class="service-field">
            <span>Precio (opcional)</span>
            <input
              v-model="viewModel.form.price"
              type="number"
              min="0"
              step="0.01"
              placeholder="150.00"
            >
          </label>
        </div>

        <label class="service-flag">
          <input v-model="viewModel.form.isActive" type="checkbox">
          <div>
            <strong>Servicio activo para agendar</strong>
          </div>
        </label>

        <div class="service-actions">
          <NuxtLink to="/services" class="service-secondary-button">
            Cancelar
          </NuxtLink>

          <button class="service-primary-button" type="submit" :disabled="viewModel.pending.value">
            {{ viewModel.pending.value ? 'Guardando...' : 'Registrar servicio' }}
          </button>
        </div>

        <p v-if="viewModel.errorMessage.value" class="service-message service-message-error">
          {{ viewModel.errorMessage.value }}
        </p>
        <p v-if="viewModel.successMessage.value" class="service-message service-message-success">
          {{ viewModel.successMessage.value }}
        </p>
      </form>
    </article>
  </div>
</template>

<style scoped>
.service-create-page {
  display: grid;
  gap: 1.1rem;
  max-width: 56rem;
}

.service-create-header {
  display: grid;
  gap: 0.9rem;
}

.service-create-back {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  gap: 0.45rem;
  color: #266c69;
  font-weight: 700;
}

.service-create-eyebrow {
  margin: 0 0 0.25rem;
  color: #2e726d;
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.service-create-title {
  margin: 0;
  color: #102e30;
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 800;
  letter-spacing: -0.05em;
}

.service-create-copy {
  margin: 0.45rem 0 0;
  color: #789ca0;
  font-size: 1rem;
}

.service-create-card {
  padding: 1.4rem;
  border-radius: 2rem;
}

.service-create-form {
  display: grid;
  gap: 1rem;
}

.service-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.service-field {
  display: grid;
  gap: 0.45rem;
}

.service-field span {
  color: #30565a;
  font-size: 0.95rem;
  font-weight: 700;
}

.service-field input,
.service-field textarea {
  width: 100%;
  border: 1px solid #d2e8e5;
  border-radius: 1.2rem;
  padding: 0.95rem 1rem;
  background: rgba(248, 252, 251, 0.96);
  color: #122f31;
  outline: none;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease;
}

.service-field input:focus,
.service-field textarea:focus {
  border-color: #29918d;
  box-shadow: 0 0 0 4px rgba(41, 145, 141, 0.12);
}

.service-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.8rem;
  padding-top: 0.4rem;
}

.service-flag {
  display: flex;
  align-items: flex-start;
  gap: 0.8rem;
  border: 1px solid #d2e8e5;
  border-radius: 1.2rem;
  padding: 1rem;
  background: rgba(248, 252, 251, 0.96);
}

.service-flag input {
  margin-top: 0.2rem;
  width: 1rem;
  height: 1rem;
  accent-color: #176f6d;
}

.service-flag strong {
  display: block;
  color: #173638;
  font-size: 0.98rem;
}

.service-primary-button,
.service-secondary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 0.95rem 1.35rem;
  font-weight: 700;
}

.service-primary-button {
  border: 0;
  background: #176f6d;
  color: white;
}

.service-primary-button:disabled {
  opacity: 0.7;
  cursor: wait;
}

.service-secondary-button {
  border: 1px solid #d6ebe8;
  background: white;
  color: #2f5f63;
}

.service-message {
  margin: 0;
  border-radius: 1rem;
  padding: 0.9rem 1rem;
  font-weight: 600;
}

.service-message-error {
  background: #fff1f2;
  color: #b91c1c;
}

.service-message-success {
  background: #ecfdf5;
  color: #047857;
}

@media (max-width: 720px) {
  .service-grid {
    grid-template-columns: 1fr;
  }

  .service-actions {
    flex-direction: column-reverse;
  }

  .service-primary-button,
  .service-secondary-button {
    width: 100%;
  }
}
</style>
