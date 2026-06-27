<script setup lang="ts">
import { useAppointmentDetailScreen } from '../../composables/appointments/use-appointment-detail-screen'

definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const appointmentId = String(route.params.id)
const screen = await useAppointmentDetailScreen(appointmentId)

const handleStatusChange = (event: Event) => {
  void screen.submitStatusSelection((event.target as HTMLSelectElement).value)
}
</script>

<template>
  <div class="page-grid">
    <SharedSectionHeader
      eyebrow="Cita"
      :title="screen.appointment.value?.patientName ?? 'Detalle de cita'"
      description="Edicion, cambio de estado y cancelacion de la cita."
    />

    <p v-if="!screen.loading.value && screen.errorMessage.value && !screen.appointment.value" class="page-error">
      {{ screen.errorMessage.value }}
    </p>

    <article v-if="screen.appointment.value" class="surface-card detail-card">
      <form class="detail-form" @submit.prevent="screen.submitAppointment">
        <label class="field">
          <span>Paciente</span>
          <select v-model="screen.form.patientId" required :disabled="!screen.isEditing.value">
            <option v-for="patient in screen.patients.value" :key="patient.id" :value="patient.id">
              {{ patient.fullName }}
            </option>
          </select>
        </label>

        <label class="field">
          <span>Servicio</span>
          <select v-model="screen.form.serviceId" required :disabled="!screen.isEditing.value">
            <option v-for="service in screen.services.value" :key="service.id" :value="service.id">
              {{ service.name }} · {{ service.defaultDurationMinutes }} min
            </option>
          </select>
        </label>

        <label class="field">
          <span>Inicio</span>
          <input v-model="screen.form.startAt" type="datetime-local" required :disabled="!screen.isEditing.value">
        </label>

        <div class="field field-wide active-field">
          <span>Urgente</span>
          <label class="active-toggle">
            <input v-model="screen.form.isUrgent" type="checkbox" :disabled="!screen.isEditing.value">
            <div>
              <strong>Marcar como urgente</strong>
            </div>
          </label>
        </div>

        <label class="field field-wide">
          <span>Motivo breve</span>
          <input v-model="screen.form.reason" type="text" :disabled="!screen.isEditing.value">
        </label>

        <label class="field field-wide">
          <span>Notas administrativas</span>
          <textarea v-model="screen.form.notes" rows="4" :disabled="!screen.isEditing.value" />
        </label>

        <label class="field field-wide">
          <span>Estado</span>
          <select
            :value="screen.appointment.value.status"
            :disabled="!screen.canChangeAppointmentStatus.value || screen.actionPending.value"
            @change="handleStatusChange"
          >
            <option
              v-for="statusOption in screen.appointmentStatusesForUi"
              :key="statusOption.value"
              :value="statusOption.value"
            >
              {{ statusOption.label }}
            </option>
          </select>
        </label>

        <div class="detail-actions">
          <span class="pill">Cita real en PostgreSQL</span>
          <div class="detail-actions-buttons">
            <template v-if="!screen.isEditing.value">
              <button
                type="button"
                class="delete-button"
                :disabled="!screen.canCancelAppointment.value || screen.actionPending.value"
                @click="screen.submitCancellation"
              >
                {{ screen.actionPending.value ? 'Procesando...' : 'Cancelar cita' }}
              </button>
              <button
                type="button"
                class="edit-button"
                :disabled="!screen.canEditAppointment.value"
                @click="screen.startEditing"
              >
                Editar
              </button>
            </template>
            <template v-else>
              <button type="button" class="cancel-button" @click="screen.cancelEditing">
                Cancelar
              </button>
              <button class="submit-button" type="submit" :disabled="screen.pending.value">
                {{ screen.pending.value ? 'Guardando...' : 'Guardar cambios' }}
              </button>
            </template>
          </div>
        </div>

        <p v-if="screen.errorMessage.value" class="message message-error">{{ screen.errorMessage.value }}</p>
        <p v-if="screen.successMessage.value" class="message message-success">{{ screen.successMessage.value }}</p>
      </form>
    </article>
  </div>
</template>

<style scoped>
.page-error {
  margin: 0;
  border-radius: 1.1rem;
  background: #fff1f2;
  color: #b91c1c;
  padding: 0.95rem 1rem;
  font-weight: 600;
}

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
.field select,
.field textarea {
  width: 100%;
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 0.8rem 0.95rem;
  background: rgba(255, 255, 255, 0.88);
  color: var(--text-main);
}

.active-field {
  gap: 0.6rem;
}

.active-toggle {
  display: flex;
  align-items: flex-start;
  gap: 0.8rem;
  border: 1px solid var(--border-color);
  border-radius: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.88);
}

.active-toggle input {
  margin-top: 0.15rem;
  width: 1rem;
  height: 1rem;
  accent-color: #0f766e;
}

.active-toggle strong {
  display: block;
  color: var(--text-main);
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
.field select:disabled,
.field textarea:disabled {
  background: rgba(15, 118, 110, 0.05);
  color: var(--text-main);
  opacity: 0.7;
  cursor: not-allowed;
}

.submit-button,
.edit-button,
.delete-button {
  border: 0;
  border-radius: 14px;
  padding: 0.95rem 1rem;
  color: white;
  font-weight: 700;
  cursor: pointer;
}

.edit-button,
.submit-button {
  background: #0f766e;
}

.delete-button {
  background: #be123c;
}

.edit-button:disabled,
.delete-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
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
