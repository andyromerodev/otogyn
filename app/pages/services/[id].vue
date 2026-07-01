<script setup lang="ts">
import { useServiceDetailViewModel } from '../../composables/services/use-service-detail-view-model'

definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const serviceId = String(route.params.id)
const viewModel = await useServiceDetailViewModel(serviceId)

const handleDelete = async () => {
  await viewModel.confirmDelete()

  if (viewModel.deleted.value) {
    await navigateTo('/services')
  }
}
</script>

<template>
  <div class="page-grid">
    <SharedSectionHeader
      eyebrow="Servicio"
      :title="viewModel.service.value?.name ?? 'Detalle de servicio'"
      description="Edicion administrativa del servicio: duracion, precio y estado."
    />

    <article v-if="viewModel.service.value" class="surface-card detail-card">
      <form class="detail-form" @submit.prevent="viewModel.submitService">
        <label class="field field-wide">
          <span>Nombre</span>
          <input v-model="viewModel.form.name" type="text" required :disabled="!viewModel.isEditing.value">
        </label>

        <label class="field field-wide">
          <span>Descripcion</span>
          <textarea v-model="viewModel.form.description" rows="4" :disabled="!viewModel.isEditing.value" />
        </label>

        <label class="field">
          <span>Duracion (min)</span>
          <input
            v-model.number="viewModel.form.defaultDurationMinutes"
            type="number"
            min="1"
            max="480"
            required
            :disabled="!viewModel.isEditing.value"
          >
        </label>

        <label class="field">
          <span>Precio (opcional)</span>
          <input
            v-model="viewModel.form.price"
            type="number"
            min="0"
            step="0.01"
            :disabled="!viewModel.isEditing.value"
          >
        </label>

        <div class="field field-wide active-field">
          <span>Estado</span>
          <label class="active-toggle">
            <input v-model="viewModel.form.isActive" type="checkbox" :disabled="!viewModel.isEditing.value">
            <div>
              <strong>Servicio activo para agendar</strong>
              <p>Si se desactiva, dejara de estar disponible para nuevas citas.</p>
            </div>
          </label>
        </div>

        <div class="detail-actions">
          <span class="pill">Servicio real en PostgreSQL</span>
          <div v-if="viewModel.canManageServices.value" class="detail-actions-buttons">
            <template v-if="!viewModel.isEditing.value">
              <button
                type="button"
                class="delete-button"
                :disabled="viewModel.deletePending.value"
                @click="viewModel.requestDelete"
              >
                {{ viewModel.deletePending.value ? 'Eliminando...' : 'Eliminar' }}
              </button>
              <button
                type="button"
                class="edit-button"
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

        <p v-if="viewModel.errorMessage.value" class="message message-error">{{ viewModel.errorMessage.value }}</p>
        <p v-if="viewModel.successMessage.value" class="message message-success">{{ viewModel.successMessage.value }}</p>
      </form>

      <SharedConfirmDialog
        v-model="viewModel.isDeleteConfirmOpen.value"
        title="Eliminar servicio"
        message="¿Confirmas eliminar este servicio de forma permanente? Esta acción no se puede deshacer."
        confirm-label="Eliminar"
        cancel-label="Cancelar"
        :pending="viewModel.deletePending.value"
        @confirm="handleDelete"
        @cancel="viewModel.cancelDelete"
      />

      <SharedConfirmDialog
        v-model="viewModel.isDeleteBlockedDialogOpen.value"
        title="No se puede eliminar"
        :message="viewModel.deleteBlockedMessage.value ?? 'Este servicio no se puede eliminar en este momento.'"
        confirm-label="Entendido"
        cancel-label="Cerrar"
        @confirm="viewModel.closeDeleteBlockedDialog"
        @cancel="viewModel.closeDeleteBlockedDialog"
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

.active-toggle p {
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

.delete-button:disabled {
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
