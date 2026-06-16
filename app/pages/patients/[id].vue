<script setup lang="ts">
import type { Patient } from '~~/src/domain/entities/patient'

definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const pending = ref(false)
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)

const { data: patient, refresh } = await useFetch<Patient>(`/api/patients/${route.params.id}`)

const form = reactive({
  fullName: '',
  phone: '',
  email: '',
  birthDate: '',
  documentId: '',
  administrativeNotes: '',
})

watchEffect(() => {
  if (!patient.value) {
    return
  }

  form.fullName = patient.value.fullName
  form.phone = patient.value.phone
  form.email = patient.value.email ?? ''
  form.birthDate = patient.value.birthDate ?? ''
  form.documentId = patient.value.documentId ?? ''
  form.administrativeNotes = patient.value.administrativeNotes ?? ''
})

const submitPatient = async () => {
  pending.value = true
  errorMessage.value = null
  successMessage.value = null

  try {
    await $fetch(`/api/patients/${route.params.id}`, {
      method: 'PATCH',
      body: {
        fullName: form.fullName,
        phone: form.phone,
        email: form.email.trim() || null,
        birthDate: form.birthDate || null,
        documentId: form.documentId.trim() || null,
        administrativeNotes: form.administrativeNotes.trim() || null,
      },
    })

    successMessage.value = 'Paciente actualizado correctamente.'
    await refresh()
  } catch (error) {
    errorMessage.value =
      error && typeof error === 'object' && 'statusMessage' in error && typeof error.statusMessage === 'string'
        ? error.statusMessage
        : 'No se pudo actualizar el paciente.'
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <div class="page-grid">
    <SharedSectionHeader
      eyebrow="Paciente"
      :title="patient?.fullName ?? 'Detalle de paciente'"
      description="Edicion administrativa del paciente. El MVP no incluye historia clinica completa."
    />

    <article v-if="patient" class="surface-card detail-card">
      <form class="detail-form" @submit.prevent="submitPatient">
        <label class="field">
          <span>Nombre completo</span>
          <input v-model="form.fullName" type="text" required>
        </label>

        <label class="field">
          <span>Telefono</span>
          <input v-model="form.phone" type="text" required>
        </label>

        <label class="field">
          <span>Email</span>
          <input v-model="form.email" type="email">
        </label>

        <label class="field">
          <span>Fecha de nacimiento</span>
          <input v-model="form.birthDate" type="date">
        </label>

        <label class="field">
          <span>Documento</span>
          <input v-model="form.documentId" type="text">
        </label>

        <label class="field field-wide">
          <span>Notas administrativas</span>
          <textarea v-model="form.administrativeNotes" rows="5" />
        </label>

        <div class="detail-actions">
          <span class="pill">Paciente real en PostgreSQL</span>
          <button class="submit-button" type="submit" :disabled="pending">
            {{ pending ? 'Guardando...' : 'Guardar cambios' }}
          </button>
        </div>

        <p v-if="errorMessage" class="message message-error">{{ errorMessage }}</p>
        <p v-if="successMessage" class="message message-success">{{ successMessage }}</p>
      </form>
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

.detail-actions {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.submit-button {
  border: 0;
  border-radius: 14px;
  padding: 0.95rem 1rem;
  background: #0f766e;
  color: white;
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
