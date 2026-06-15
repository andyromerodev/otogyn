<script setup lang="ts">
import type { Patient } from '~~/src/domain/entities/patient'

definePageMeta({
  middleware: 'auth',
})

const form = reactive({
  fullName: '',
  phone: '',
  email: '',
  birthDate: '',
  documentId: '',
  administrativeNotes: '',
})

const pending = ref(false)
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)

const { data: patients, refresh } = await useFetch<Patient[]>('/api/patients')

const submitPatient = async () => {
  pending.value = true
  errorMessage.value = null
  successMessage.value = null

  try {
    await $fetch('/api/patients', {
      method: 'POST',
      body: {
        fullName: form.fullName,
        phone: form.phone,
        email: form.email.trim() || null,
        birthDate: form.birthDate || null,
        documentId: form.documentId.trim() || null,
        administrativeNotes: form.administrativeNotes.trim() || null,
      },
    })

    form.fullName = ''
    form.phone = ''
    form.email = ''
    form.birthDate = ''
    form.documentId = ''
    form.administrativeNotes = ''

    successMessage.value = 'Paciente registrado correctamente.'
    await refresh()
  } catch (error) {
    errorMessage.value =
      error && typeof error === 'object' && 'statusMessage' in error && typeof error.statusMessage === 'string'
        ? error.statusMessage
        : 'No se pudo registrar el paciente.'
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <div class="page-grid">
    <SharedSectionHeader
      eyebrow="Pacientes"
      title="Registro y listado de pacientes"
      description="Los pacientes se guardan en PostgreSQL y se listan por organizacion activa."
    />

    <section class="patients-layout">
      <article class="surface-card patient-form-card">
        <div class="patient-form-header">
          <p class="patient-form-title">Nuevo paciente</p>
          <p class="muted-text">Solo datos administrativos para el MVP.</p>
        </div>

        <form class="patient-form" @submit.prevent="submitPatient">
          <label class="field">
            <span>Nombre completo</span>
            <input v-model="form.fullName" type="text" placeholder="Maria Torres" required>
          </label>

          <label class="field">
            <span>Telefono</span>
            <input v-model="form.phone" type="text" placeholder="999888777" required>
          </label>

          <label class="field">
            <span>Email</span>
            <input v-model="form.email" type="email" placeholder="maria@example.com">
          </label>

          <label class="field">
            <span>Fecha de nacimiento</span>
            <input v-model="form.birthDate" type="date">
          </label>

          <label class="field">
            <span>Documento</span>
            <input v-model="form.documentId" type="text" placeholder="DNI o cedula">
          </label>

          <label class="field">
            <span>Notas administrativas</span>
            <textarea v-model="form.administrativeNotes" rows="4" placeholder="Preferencias de agenda, contacto o seguimiento administrativo." />
          </label>

          <button class="submit-button" type="submit" :disabled="pending">
            {{ pending ? 'Guardando...' : 'Registrar paciente' }}
          </button>

          <p v-if="errorMessage" class="message message-error">{{ errorMessage }}</p>
          <p v-if="successMessage" class="message message-success">{{ successMessage }}</p>
        </form>
      </article>

      <section class="patients-grid">
        <article
          v-for="patient in patients ?? []"
          :key="patient.id"
          class="surface-card patient-card"
        >
          <div>
            <p class="patient-name">{{ patient.fullName }}</p>
            <p class="muted-text">{{ patient.phone }}</p>
            <p class="muted-text">{{ patient.email ?? 'Sin email' }}</p>
          </div>

          <div class="patient-card-footer">
            <span class="pill">Paciente</span>
            <NuxtLink :to="`/patients/${patient.id}`">
              <UButton color="neutral" variant="outline" size="sm">Ver detalle</UButton>
            </NuxtLink>
          </div>
        </article>
      </section>
    </section>
  </div>
</template>

<style scoped>
.patients-layout {
  display: grid;
  grid-template-columns: minmax(320px, 420px) minmax(0, 1fr);
  gap: 1rem;
  align-items: start;
}

.patient-form-card,
.patient-card {
  padding: 1.25rem;
}

.patient-form-card {
  display: grid;
  gap: 1rem;
}

.patient-form-header {
  display: grid;
  gap: 0.35rem;
}

.patient-form-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
}

.patient-form {
  display: grid;
  gap: 0.9rem;
}

.field {
  display: grid;
  gap: 0.35rem;
  font-weight: 600;
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

.patients-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.patient-card {
  display: grid;
  gap: 1rem;
}

.patient-name {
  margin: 0 0 0.35rem;
  font-size: 1.1rem;
  font-weight: 700;
}

.patient-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

@media (max-width: 1100px) {
  .patients-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 960px) {
  .patients-grid {
    grid-template-columns: 1fr;
  }
}
</style>
