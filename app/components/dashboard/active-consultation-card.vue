<script setup lang="ts">
import type { ActiveConsultationViewModel } from '~~/src/application/dto/dashboard-management'

defineProps<{
  consultation: ActiveConsultationViewModel
}>()
</script>

<template>
  <article class="active-consultation-card">
    <p class="active-consultation-eyebrow">
      <UIcon name="i-heroicons-signal" />
      CONSULTA ACTIVA
    </p>

    <p class="active-consultation-patient">{{ consultation.patientName }}</p>
    <p class="active-consultation-service">{{ consultation.serviceName }}</p>

    <div class="active-consultation-meta">
      <span>{{ consultation.timeLabel }}</span>
      <span>{{ consultation.durationMinutes }} min</span>
    </div>

    <NuxtLink :to="`/consultations/${consultation.appointmentId}`" class="active-consultation-cta">
      Abrir consulta
      <UIcon name="i-heroicons-arrow-right" />
    </NuxtLink>
  </article>
</template>

<style scoped>
.active-consultation-card {
  border-radius: 1.5rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #0f766e, #134e4a);
  color: white;
}

.active-consultation-eyebrow {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.8);
}

.active-consultation-patient {
  margin: 0.75rem 0 0;
  font-size: 1.35rem;
  font-weight: 700;
}

.active-consultation-service {
  margin: 0.25rem 0 0;
  color: rgba(255, 255, 255, 0.85);
}

.active-consultation-meta {
  display: flex;
  gap: 1rem;
  margin-top: 0.85rem;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.85);
}

.active-consultation-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 1.25rem;
  padding: 0.65rem 1.25rem;
  border-radius: 0.85rem;
  background: white;
  color: #0f766e;
  font-weight: 600;
}
</style>
