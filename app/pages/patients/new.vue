<script setup lang="ts">
import { usePatientCreateScreen } from '../../composables/patients/use-patient-create-screen'

definePageMeta({
  middleware: 'auth',
})

const screen = usePatientCreateScreen()
</script>

<template>
  <div class="patient-create-page">
    <div class="patient-create-header">
      <NuxtLink to="/patients" class="patient-create-back">
        <UIcon name="i-heroicons-arrow-left-20-solid" />
        <span>Volver a pacientes</span>
      </NuxtLink>

      <div>
        <p class="patient-create-eyebrow">Pacientes</p>
        <h1 class="patient-create-title">Nuevo paciente</h1>
        <p class="patient-create-copy">Registra solo datos administrativos de contacto y seguimiento.</p>
      </div>
    </div>

    <article class="surface-card patient-create-card">
      <form class="patient-create-form" @submit.prevent="screen.submitPatient">
        <label class="patient-field">
          <span>Nombre completo</span>
          <input v-model="screen.form.fullName" type="text" placeholder="María Torres" required>
        </label>

        <div class="patient-grid">
          <label class="patient-field">
            <span>Teléfono</span>
            <input v-model="screen.form.phone" type="text" placeholder="999888777" required>
          </label>

          <label class="patient-field">
            <span>Email</span>
            <input v-model="screen.form.email" type="email" placeholder="maria@example.com">
          </label>
        </div>

        <div class="patient-grid">
          <label class="patient-field">
            <span>Fecha de nacimiento</span>
            <input v-model="screen.form.birthDate" type="date">
          </label>

          <label class="patient-field">
            <span>Documento</span>
            <input v-model="screen.form.documentId" type="text" placeholder="DNI o cédula">
          </label>
        </div>

        <label class="patient-field">
          <span>Notas administrativas</span>
          <textarea
            v-model="screen.form.administrativeNotes"
            rows="5"
            placeholder="Preferencias de agenda, contacto o seguimiento administrativo."
          />
        </label>

        <label class="patient-flag">
          <input v-model="screen.form.isUrgent" type="checkbox">
          <div>
            <strong>Marcar paciente como urgente</strong>
            <p>Se resaltará en listados y quedará dentro del filtro Urgentes.</p>
          </div>
        </label>

        <div class="patient-actions">
          <NuxtLink to="/patients" class="patient-secondary-button">
            Cancelar
          </NuxtLink>

          <button class="patient-primary-button" type="submit" :disabled="screen.pending.value">
            {{ screen.pending.value ? 'Guardando...' : 'Registrar paciente' }}
          </button>
        </div>

        <p v-if="screen.errorMessage.value" class="patient-message patient-message-error">
          {{ screen.errorMessage.value }}
        </p>
        <p v-if="screen.successMessage.value" class="patient-message patient-message-success">
          {{ screen.successMessage.value }}
        </p>
      </form>
    </article>
  </div>
</template>

<style scoped>
.patient-create-page {
  display: grid;
  gap: 1.1rem;
  max-width: 56rem;
}

.patient-create-header {
  display: grid;
  gap: 0.9rem;
}

.patient-create-back {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  gap: 0.45rem;
  color: #266c69;
  font-weight: 700;
}

.patient-create-eyebrow {
  margin: 0 0 0.25rem;
  color: #2e726d;
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.patient-create-title {
  margin: 0;
  color: #102e30;
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 800;
  letter-spacing: -0.05em;
}

.patient-create-copy {
  margin: 0.45rem 0 0;
  color: #789ca0;
  font-size: 1rem;
}

.patient-create-card {
  padding: 1.4rem;
  border-radius: 2rem;
}

.patient-create-form {
  display: grid;
  gap: 1rem;
}

.patient-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.patient-field {
  display: grid;
  gap: 0.45rem;
}

.patient-field span {
  color: #30565a;
  font-size: 0.95rem;
  font-weight: 700;
}

.patient-field input,
.patient-field textarea {
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

.patient-field input:focus,
.patient-field textarea:focus {
  border-color: #29918d;
  box-shadow: 0 0 0 4px rgba(41, 145, 141, 0.12);
}

.patient-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.8rem;
  padding-top: 0.4rem;
}

.patient-flag {
  display: flex;
  align-items: flex-start;
  gap: 0.8rem;
  border: 1px solid #d2e8e5;
  border-radius: 1.2rem;
  padding: 1rem;
  background: rgba(248, 252, 251, 0.96);
}

.patient-flag input {
  margin-top: 0.2rem;
  width: 1rem;
  height: 1rem;
  accent-color: #176f6d;
}

.patient-flag strong {
  display: block;
  color: #173638;
  font-size: 0.98rem;
}

.patient-flag p {
  margin: 0.28rem 0 0;
  color: #6d8f92;
  font-size: 0.92rem;
}

.patient-primary-button,
.patient-secondary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 0.95rem 1.35rem;
  font-weight: 700;
}

.patient-primary-button {
  border: 0;
  background: #176f6d;
  color: white;
}

.patient-primary-button:disabled {
  opacity: 0.7;
  cursor: wait;
}

.patient-secondary-button {
  border: 1px solid #d6ebe8;
  background: white;
  color: #2f5f63;
}

.patient-message {
  margin: 0;
  border-radius: 1rem;
  padding: 0.9rem 1rem;
  font-weight: 600;
}

.patient-message-error {
  background: #fff1f2;
  color: #b91c1c;
}

.patient-message-success {
  background: #ecfdf5;
  color: #047857;
}

@media (max-width: 720px) {
  .patient-grid {
    grid-template-columns: 1fr;
  }

  .patient-actions {
    flex-direction: column-reverse;
  }

  .patient-primary-button,
  .patient-secondary-button {
    width: 100%;
  }
}
</style>
