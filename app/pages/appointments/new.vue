<script setup lang="ts">
import { useAppointmentCreateViewModel } from '../../composables/appointments/use-appointment-create-view-model'

definePageMeta({
  middleware: 'auth',
})

const viewModel = await useAppointmentCreateViewModel()

const handleSubmit = async () => {
  await viewModel.submitAppointment()

  if (viewModel.createdAppointment.value) {
    await navigateTo('/appointments')
  }
}
</script>

<template>
  <div class="appointment-create-page">
    <div class="appointment-create-header">
      <NuxtLink to="/appointments" class="appointment-create-back">
        <UIcon name="i-heroicons-arrow-left-20-solid" />
        <span>Volver a citas</span>
      </NuxtLink>

      <div>
        <p class="appointment-create-eyebrow">Citas</p>
        <h1 class="appointment-create-title">Nueva cita</h1>
        <p class="appointment-create-copy">
          Si no hay disponibilidad configurada, se crea una base inicial de lunes a viernes, 09:00 a 18:00.
        </p>
      </div>
    </div>

    <article class="surface-card appointment-create-card">
      <div
        v-if="!viewModel.loading.value && (!viewModel.patients.value.length || !viewModel.services.value.length)"
        class="appointment-create-warning"
      >
        Necesitas al menos un paciente y un servicio para registrar citas.
      </div>

      <form v-else class="appointment-create-form" @submit.prevent="handleSubmit">
        <label class="appointment-field">
          <span>Paciente</span>
          <select v-model="viewModel.form.patientId" required>
            <option v-for="patient in viewModel.patients.value" :key="patient.id" :value="patient.id">
              {{ patient.fullName }}
            </option>
          </select>
        </label>

        <label class="appointment-field">
          <span>Servicio</span>
          <select v-model="viewModel.form.serviceId" required>
            <option v-for="service in viewModel.services.value" :key="service.id" :value="service.id">
              {{ service.name }} · {{ service.defaultDurationMinutes }} min
            </option>
          </select>
        </label>

        <label class="appointment-field">
          <span>Inicio</span>
          <input v-model="viewModel.form.startAt" type="datetime-local" required>
        </label>

        <label class="appointment-flag">
          <input v-model="viewModel.form.isUrgent" type="checkbox">
          <div>
            <strong>Marcar como urgente</strong>
          </div>
        </label>

        <label class="appointment-field">
          <span>Motivo breve</span>
          <input v-model="viewModel.form.reason" type="text" placeholder="Control postoperatorio">
        </label>

        <label class="appointment-field">
          <span>Notas administrativas</span>
          <textarea
            v-model="viewModel.form.notes"
            rows="4"
            placeholder="Observaciones de agenda o coordinacion."
          />
        </label>

        <div class="appointment-actions">
          <NuxtLink to="/appointments" class="appointment-secondary-button">
            Cancelar
          </NuxtLink>

          <button class="appointment-primary-button" type="submit" :disabled="viewModel.pending.value">
            {{ viewModel.pending.value ? 'Guardando...' : 'Registrar cita' }}
          </button>
        </div>

        <p v-if="viewModel.errorMessage.value" class="appointment-message appointment-message-error">
          {{ viewModel.errorMessage.value }}
        </p>
        <p v-if="viewModel.successMessage.value" class="appointment-message appointment-message-success">
          {{ viewModel.successMessage.value }}
        </p>
      </form>
    </article>
  </div>
</template>

<style scoped>
.appointment-create-page {
  display: grid;
  gap: 1.1rem;
  max-width: 56rem;
}

.appointment-create-header {
  display: grid;
  gap: 0.9rem;
}

.appointment-create-back {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  gap: 0.45rem;
  color: #266c69;
  font-weight: 700;
}

.appointment-create-eyebrow {
  margin: 0 0 0.25rem;
  color: #2e726d;
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.appointment-create-title {
  margin: 0;
  color: #102e30;
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 800;
  letter-spacing: -0.05em;
}

.appointment-create-copy {
  margin: 0.45rem 0 0;
  color: #789ca0;
  font-size: 1rem;
}

.appointment-create-card {
  padding: 1.4rem;
  border-radius: 2rem;
}

.appointment-create-warning {
  border-radius: 1rem;
  background: #fff7ed;
  color: #b45309;
  padding: 0.95rem 1rem;
  font-weight: 600;
}

.appointment-create-form {
  display: grid;
  gap: 1rem;
}

.appointment-field {
  display: grid;
  gap: 0.45rem;
}

.appointment-field span {
  color: #30565a;
  font-size: 0.95rem;
  font-weight: 700;
}

.appointment-field input,
.appointment-field select,
.appointment-field textarea {
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

.appointment-field input:focus,
.appointment-field select:focus,
.appointment-field textarea:focus {
  border-color: #29918d;
  box-shadow: 0 0 0 4px rgba(41, 145, 141, 0.12);
}

.appointment-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.8rem;
  padding-top: 0.4rem;
}

.appointment-flag {
  display: flex;
  align-items: flex-start;
  gap: 0.8rem;
  border: 1px solid #d2e8e5;
  border-radius: 1.2rem;
  padding: 1rem;
  background: rgba(248, 252, 251, 0.96);
}

.appointment-flag input {
  margin-top: 0.2rem;
  width: 1rem;
  height: 1rem;
  accent-color: #176f6d;
}

.appointment-flag strong {
  display: block;
  color: #173638;
  font-size: 0.98rem;
}

.appointment-primary-button,
.appointment-secondary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 0.95rem 1.35rem;
  font-weight: 700;
}

.appointment-primary-button {
  border: 0;
  background: #176f6d;
  color: white;
}

.appointment-primary-button:disabled {
  opacity: 0.7;
  cursor: wait;
}

.appointment-secondary-button {
  border: 1px solid #d6ebe8;
  background: white;
  color: #2f5f63;
}

.appointment-message {
  margin: 0;
  border-radius: 1rem;
  padding: 0.9rem 1rem;
  font-weight: 600;
}

.appointment-message-error {
  background: #fff1f2;
  color: #b91c1c;
}

.appointment-message-success {
  background: #ecfdf5;
  color: #047857;
}

@media (max-width: 720px) {
  .appointment-actions {
    flex-direction: column-reverse;
  }

  .appointment-primary-button,
  .appointment-secondary-button {
    width: 100%;
  }
}
</style>
