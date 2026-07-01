<script setup lang="ts">
import { usePatientDetailViewModel } from '../../composables/patients/use-patient-detail-view-model'

definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const patientId = String(route.params.id)
const viewModel = await usePatientDetailViewModel(patientId)
</script>

<template>
  <div class="page-grid">
    <SharedSectionHeader
      eyebrow="Paciente"
      :title="viewModel.patient.value?.fullName ?? 'Detalle de paciente'"
      description="Edicion administrativa del paciente. El MVP no incluye historia clinica completa."
    />

    <article v-if="viewModel.patient.value" class="surface-card detail-card">
      <form class="detail-form" @submit.prevent="viewModel.requestSave">
        <label class="field">
          <span>Nombre completo</span>
          <input v-model="viewModel.form.fullName" type="text" required :disabled="!viewModel.isEditing.value">
        </label>

        <label class="field">
          <span>Telefono</span>
          <input v-model="viewModel.form.phone" type="text" required :disabled="!viewModel.isEditing.value">
        </label>

        <label class="field">
          <span>Email</span>
          <input v-model="viewModel.form.email" type="email" :disabled="!viewModel.isEditing.value">
        </label>

        <label class="field">
          <span>Fecha de nacimiento</span>
          <input v-model="viewModel.form.birthDate" type="date" :disabled="!viewModel.isEditing.value">
        </label>

        <label class="field">
          <span>Documento</span>
          <input v-model="viewModel.form.documentId" type="text" :disabled="!viewModel.isEditing.value">
        </label>

        <label class="field field-wide">
          <span>Notas administrativas</span>
          <textarea v-model="viewModel.form.administrativeNotes" rows="5" :disabled="!viewModel.isEditing.value" />
        </label>

        <div class="field field-wide urgent-field">
          <span>Prioridad</span>
          <label class="urgent-toggle">
            <input v-model="viewModel.form.isUrgent" type="checkbox" :disabled="!viewModel.isEditing.value">
            <div>
              <strong>Paciente urgente</strong>
              <p>Se mostrará con badge rojo en listados y dentro del filtro Urgentes.</p>
            </div>
          </label>
        </div>

        <div class="detail-actions">
          <span class="pill">Paciente real en PostgreSQL</span>
          <div class="detail-actions-buttons">
            <button
              v-if="!viewModel.isEditing.value"
              type="button"
              class="edit-button"
              @click="viewModel.startEditing"
            >
              Editar
            </button>
            <template v-else>
              <button type="button" class="cancel-button" @click="viewModel.cancelEditing">
                Cancelar
              </button>
              <button class="submit-button" type="submit" :disabled="viewModel.pending.value">
                {{ viewModel.pending.value ? 'Guardando...' : 'Guardar cambios' }}
              </button>
            </template>
          </div>
        </div>

        <p v-if="viewModel.errorMessage.value" class="message message-error">{{ viewModel.errorMessage.value }}</p>
        <p v-if="viewModel.successMessage.value" class="message message-success">{{ viewModel.successMessage.value }}</p>
      </form>

      <SharedConfirmDialog
        v-model="viewModel.isConfirmOpen.value"
        title="Confirmar cambios"
        message="¿Confirmas guardar los cambios del paciente?"
        :pending="viewModel.pending.value"
        @confirm="viewModel.confirmSave"
        @cancel="viewModel.cancelConfirm"
      />
    </article>
  </div>
</template>

<style scoped>
.detail-card {
  padding: 1.5rem;
}

.detail-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.field {
  display: grid;
  gap: 0.35rem;
  font-weight: 600;
}

.field-wide {
  grid-column: 1 / -1;
}

.field input,
.field textarea {
  width: 100%;
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 0.8rem 0.95rem;
  background: rgba(255, 255, 255, 0.88);
  color: var(--text-main);
}

.urgent-field {
  gap: 0.6rem;
}

.urgent-toggle {
  display: flex;
  align-items: flex-start;
  gap: 0.8rem;
  border: 1px solid var(--border-color);
  border-radius: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.88);
}

.urgent-toggle input {
  margin-top: 0.15rem;
  width: 1rem;
  height: 1rem;
  accent-color: #0f766e;
}

.urgent-toggle strong {
  display: block;
  color: var(--text-main);
}

.urgent-toggle p {
  margin: 0.28rem 0 0;
  color: var(--text-soft);
  font-size: 0.92rem;
}

.detail-actions {
  grid-column: 1 / -1;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.detail-actions-buttons {
  display: flex;
  gap: 0.75rem;
}

.field input:disabled,
.field textarea:disabled {
  background: rgba(15, 118, 110, 0.05);
  color: var(--text-main);
  opacity: 0.7;
  cursor: not-allowed;
}

.submit-button,
.edit-button {
  border: 0;
  border-radius: 14px;
  padding: 0.95rem 1rem;
  background: #0f766e;
  color: white;
  font-weight: 700;
  cursor: pointer;
}

.cancel-button {
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 0.95rem 1rem;
  background: transparent;
  color: var(--text-main);
  font-weight: 700;
  cursor: pointer;
}

.submit-button:disabled {
  cursor: wait;
  opacity: 0.7;
}

.message {
  grid-column: 1 / -1;
  margin: 0;
  border-radius: 12px;
  padding: 0.75rem 0.9rem;
  font-weight: 600;
}

.message-error {
  background: #fff1f2;
  color: #b91c1c;
}

.message-success {
  background: #ecfdf5;
  color: #047857;
}

@media (max-width: 960px) {
  .detail-form {
    grid-template-columns: 1fr;
  }
}
</style>
