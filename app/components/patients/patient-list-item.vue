<script setup lang="ts">
import type { PatientListItem } from '~~/src/domain/repositories/patient-repository'

const props = defineProps<{
  patient: PatientListItem
}>()

const initials = computed(() => {
  const words = props.patient.fullName.trim().split(/\s+/).filter(Boolean)

  if (!words.length) {
    return '?'
  }

  const first = words[0]?.[0] ?? ''
  const last = words.length > 1 ? words[words.length - 1]?.[0] ?? '' : ''

  return `${first}${last}`.toUpperCase()
})
</script>

<template>
  <NuxtLink :to="`/patients/${patient.id}`" class="patient-row-link">
    <article class="patient-row">
      <div v-if="patient.isUrgent || patient.hasUrgentAppointment" class="patient-badges">
        <span v-if="patient.isUrgent" class="patient-urgent">Urgente</span>
        <span v-if="patient.hasUrgentAppointment" class="patient-urgent patient-urgent-appointment">
          Cita urgente
        </span>
      </div>

      <div class="patient-row-content">
        <div class="patient-row-main">
          <span class="patient-avatar">{{ initials }}</span>

          <div class="patient-copy">
            <p class="patient-name">{{ patient.fullName }}</p>
            <p class="patient-subtitle">Sin diagnóstico registrado</p>
          </div>
        </div>

        <div class="patient-row-side">
          <span class="patient-status">activo</span>
          <UIcon name="i-heroicons-chevron-right-20-solid" class="patient-chevron" />
        </div>
      </div>
    </article>
  </NuxtLink>
</template>

<style scoped>
.patient-row-link {
  display: block;
  color: inherit;
}

.patient-row {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1.25rem 1.2rem;
  transition:
    background-color 160ms ease,
    transform 160ms ease;
}

.patient-row-link:hover .patient-row {
  background: rgba(245, 251, 250, 0.88);
}

.patient-row-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.patient-row-main,
.patient-row-side {
  display: flex;
  align-items: center;
}

.patient-row-main {
  min-width: 0;
  gap: 1rem;
}

.patient-avatar {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 4.2rem;
  height: 4.2rem;
  border-radius: 999px;
  background: #b7d8d7;
  color: #165f61;
  font-size: 1.4rem;
  font-weight: 800;
  letter-spacing: -0.04em;
}

.patient-copy {
  min-width: 0;
}

.patient-name {
  margin: 0;
  color: #111827;
  font-size: 1.18rem;
  font-weight: 700;
  line-height: 1.15;
}

.patient-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.patient-urgent {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.22rem 0.7rem;
  border-radius: 999px;
  background: #fbe8eb;
  color: #b4233c;
  font-size: 0.88rem;
  font-weight: 700;
  white-space: nowrap;
}

.patient-urgent-appointment {
  background: #fef3e2;
  color: #b45309;
}

.patient-subtitle {
  margin: 0.35rem 0 0;
  color: #6f9a9d;
  font-size: 1rem;
  line-height: 1.35;
}

.patient-row-side {
  flex: 0 0 auto;
  gap: 0.65rem;
}

.patient-status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 4.9rem;
  padding: 0.35rem 0.8rem;
  border-radius: 999px;
  background: #e4f3ee;
  color: #21695f;
  font-size: 0.92rem;
  font-weight: 700;
  text-transform: lowercase;
}

.patient-chevron {
  color: #80a9a9;
  font-size: 1.35rem;
}

@media (max-width: 640px) {
  .patient-row {
    padding: 1.1rem 1rem;
  }

  .patient-avatar {
    width: 3.8rem;
    height: 3.8rem;
    font-size: 1.25rem;
  }

  .patient-name {
    font-size: 1rem;
  }

  .patient-subtitle {
    font-size: 0.95rem;
  }

  .patient-row-side {
    align-self: stretch;
    flex-direction: column;
    justify-content: center;
  }
}
</style>
