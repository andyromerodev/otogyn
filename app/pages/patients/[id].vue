<script setup lang="ts">
import type { Patient } from '../../../src/domain/entities/patient'

const route = useRoute()
const { data: patient } = await useFetch<Patient>(`/api/patients/${route.params.id}`)
</script>

<template>
  <div class="page-grid">
    <SharedSectionHeader
      eyebrow="Paciente"
      :title="patient?.fullName ?? 'Detalle de paciente'"
      description="Vista inicial administrativa. El MVP no incluye historia clinica completa."
    />

    <article v-if="patient" class="surface-card detail-card">
      <p><strong>Telefono:</strong> {{ patient.phone }}</p>
      <p><strong>Email:</strong> {{ patient.email ?? 'No registrado' }}</p>
      <p><strong>Documento:</strong> {{ patient.documentId ?? 'No registrado' }}</p>
      <p><strong>Notas administrativas:</strong> {{ patient.administrativeNotes ?? 'Sin notas' }}</p>
    </article>
  </div>
</template>

<style scoped>
.detail-card {
  padding: 1.5rem;
}

.detail-card p {
  margin: 0 0 0.8rem;
}
</style>
