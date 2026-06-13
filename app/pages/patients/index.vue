<script setup lang="ts">
import type { Patient } from '../../../src/domain/entities/patient'

definePageMeta({
  middleware: 'auth',
})

const { data: patients } = await useFetch<Patient[]>('/api/patients')
</script>

<template>
  <div class="page-grid">
    <SharedSectionHeader
      eyebrow="Pacientes"
      title="Base del modulo de pacientes"
      description="Listado administrativo minimo con datos no sensibles y notas solo operativas."
    />

    <div class="patients-grid">
      <article
        v-for="patient in patients ?? []"
        :key="patient.id"
        class="surface-card patient-card"
      >
        <div>
          <p class="patient-name">{{ patient.fullName }}</p>
          <p class="muted-text">{{ patient.phone }}</p>
        </div>
        <div class="patient-card-footer">
          <span class="pill">Paciente</span>
          <NuxtLink :to="`/patients/${patient.id}`">
            <UButton color="neutral" variant="outline" size="sm">Ver detalle</UButton>
          </NuxtLink>
        </div>
      </article>
    </div>
  </div>
</template>

<style scoped>
.patients-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.patient-card {
  display: grid;
  gap: 1rem;
  padding: 1.25rem;
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

@media (max-width: 960px) {
  .patients-grid {
    grid-template-columns: 1fr;
  }
}
</style>
