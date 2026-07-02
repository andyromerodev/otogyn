<script setup lang="ts">
import { parseAppDateTime, toAppTimeLabel } from '~~/src/application/utils/date/local-date'
import { useAppointmentDetailViewModel } from '../../composables/appointments/use-appointment-detail-view-model'

definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const appointmentId = String(route.params.id)
const viewModel = await useAppointmentDetailViewModel(appointmentId)

const handleStatusChange = (event: Event) => {
  void viewModel.submitStatusSelection((event.target as HTMLSelectElement).value)
}

const formatSlotTime = (iso: string) =>
  toAppTimeLabel(new Date(iso))

const isSlotSelected = (startsAt: string) => {
  const current = parseAppDateTime(viewModel.form.startAt)
  const slot = new Date(startsAt)
  return current.getTime() === slot.getTime()
}
</script>

<template>
  <div class="page-grid">
    <SharedSectionHeader
      eyebrow="Cita"
      :title="viewModel.appointment.value?.patientName ?? 'Detalle de cita'"
      description="Edicion, cambio de estado y cancelacion de la cita."
    />

    <p v-if="!viewModel.loading.value && viewModel.errorMessage.value && !viewModel.appointment.value" class="page-error">
      {{ viewModel.errorMessage.value }}
    </p>

    <article v-if="viewModel.appointment.value" class="surface-card detail-card">
      <form class="detail-form" @submit.prevent="viewModel.submitAppointment">
        <label class="field">
          <span>Paciente</span>
          <select v-model="viewModel.form.patientId" required :disabled="!viewModel.isEditing.value">
            <option v-for="patient in viewModel.patients.value" :key="patient.id" :value="patient.id">
              {{ patient.fullName }}
            </option>
          </select>
        </label>

        <label class="field">
          <span>Servicio</span>
          <select v-model="viewModel.form.serviceId" required :disabled="!viewModel.isEditing.value">
            <option v-for="service in viewModel.services.value" :key="service.id" :value="service.id">
              {{ service.name }} · {{ service.defaultDurationMinutes }} min
            </option>
          </select>
        </label>

        <label class="field">
          <span>Inicio</span>
          <input v-model="viewModel.form.startAt" type="datetime-local" required :disabled="!viewModel.isEditing.value">
        </label>

        <div v-if="viewModel.isEditing.value" class="field field-wide slots-field">
          <span>Horarios disponibles</span>
          <input v-model="viewModel.slotsDate.value" type="date" class="slots-date-input">

          <p v-if="viewModel.loadingSlots.value" class="slots-hint">Buscando horarios...</p>
          <p v-else-if="!viewModel.availableSlots.value.length" class="slots-hint">
            No hay horarios libres ese dia para el servicio seleccionado.
          </p>
          <div v-else class="slots-grid">
            <button
              v-for="slot in viewModel.availableSlots.value"
              :key="slot.startsAt"
              type="button"
              class="slot-button"
              :class="{ 'slot-button-selected': isSlotSelected(slot.startsAt) }"
              @click="viewModel.selectSlot(slot)"
            >
              {{ formatSlotTime(slot.startsAt) }}
            </button>
          </div>
        </div>

        <div class="field field-wide active-field">
          <span>Urgente</span>
          <label class="active-toggle">
            <input v-model="viewModel.form.isUrgent" type="checkbox" :disabled="!viewModel.isEditing.value">
            <div>
              <strong>Marcar como urgente</strong>
            </div>
          </label>
        </div>

        <label class="field field-wide">
          <span>Motivo breve</span>
          <input v-model="viewModel.form.reason" type="text" :disabled="!viewModel.isEditing.value">
        </label>

        <label class="field field-wide">
          <span>Notas administrativas</span>
          <textarea v-model="viewModel.form.notes" rows="4" :disabled="!viewModel.isEditing.value" />
        </label>

        <label class="field field-wide">
          <span>Estado</span>
          <select
            :value="viewModel.appointment.value.status"
            :disabled="!viewModel.canChangeAppointmentStatus.value || viewModel.changingStatusPending.value"
            @change="handleStatusChange"
          >
            <option
              v-for="statusOption in viewModel.appointmentStatusesForUi"
              :key="statusOption.value"
              :value="statusOption.value"
            >
              {{ statusOption.label }}
            </option>
          </select>
          <span v-if="viewModel.changingStatusPending.value" class="field-inline-hint">Actualizando estado...</span>
        </label>

        <div class="detail-actions">
          <span class="pill">Cita real en PostgreSQL</span>
          <div class="detail-actions-buttons">
            <template v-if="!viewModel.isEditing.value">
              <button
                type="button"
                class="delete-button"
                :disabled="!viewModel.canCancelAppointment.value || viewModel.cancelingPending.value"
                @click="viewModel.submitCancellation"
              >
                {{ viewModel.cancelingPending.value ? 'Cancelando...' : 'Cancelar cita' }}
              </button>
              <button
                type="button"
                class="edit-button"
                :disabled="!viewModel.canEditAppointment.value"
                @click="viewModel.startEditing"
              >
                Editar
              </button>
            </template>
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

        <p
          v-if="viewModel.errorMessage.value"
          class="message"
          :class="viewModel.errorKind.value === 'server' ? 'message-error' : 'message-warning'"
        >
          {{ viewModel.errorMessage.value }}
          <span v-if="viewModel.errorKind.value === 'server'" class="message-hint">Intenta de nuevo en unos segundos.</span>
        </p>
        <p v-if="viewModel.successMessage.value" class="message message-success">{{ viewModel.successMessage.value }}</p>
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

.message-warning {
  background: #fffbeb;
  color: #92400e;
}

.message-hint {
  display: block;
  margin-top: 0.25rem;
  font-weight: 500;
  font-size: 0.85rem;
  opacity: 0.85;
}

.message-success {
  background: #ecfdf5;
  color: #047857;
}

.field-inline-hint {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-main);
  opacity: 0.65;
}

.slots-field {
  gap: 0.6rem;
  border: 1px solid var(--border-color);
  border-radius: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.88);
}

.slots-date-input {
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 0.6rem 0.75rem;
  background: white;
  color: var(--text-main);
  width: fit-content;
}

.slots-hint {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 500;
  opacity: 0.7;
}

.slots-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.slot-button {
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 0.55rem 0.85rem;
  background: white;
  color: var(--text-main);
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
}

.slot-button:hover {
  border-color: #0f766e;
}

.slot-button-selected {
  background: #0f766e;
  border-color: #0f766e;
  color: white;
}

@media (max-width: 960px) {
  .detail-form {
    grid-template-columns: 1fr;
  }
}
</style>
