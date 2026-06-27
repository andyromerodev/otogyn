<script setup lang="ts">
import type { TodayAppointmentViewModel } from '~~/src/presentation/view-models/dashboard'

defineProps<{
  appointment: TodayAppointmentViewModel
}>()
</script>

<template>
  <NuxtLink :to="`/appointments/${appointment.id}`" class="appointment-row-link">
    <article class="appointment-row">
      <div class="appointment-row-content">
        <div class="appointment-row-main">
          <span class="appointment-time">{{ appointment.timeLabel }}</span>

          <div class="appointment-copy">
            <p class="appointment-patient">{{ appointment.patientName }}</p>
            <p class="appointment-service">{{ appointment.serviceName }}</p>
            <div class="appointment-chips">
              <span class="appointment-chip">{{ appointment.statusLabel }}</span>
              <span v-if="appointment.isUrgent" class="appointment-chip appointment-chip-urgent">Urgente</span>
            </div>
          </div>
        </div>

        <div class="appointment-row-side">
          <UIcon name="i-heroicons-chevron-right-20-solid" class="appointment-chevron" />
        </div>
      </div>
    </article>
  </NuxtLink>
</template>

<style scoped>
.appointment-row-link {
  display: block;
  color: inherit;
}

.appointment-row {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1.25rem 1.2rem;
  transition:
    background-color 160ms ease,
    transform 160ms ease;
}

.appointment-row-link:hover .appointment-row {
  background: rgba(245, 251, 250, 0.88);
}

.appointment-row-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.appointment-row-main,
.appointment-row-side {
  display: flex;
  align-items: center;
}

.appointment-row-main {
  min-width: 0;
  gap: 1rem;
}

.appointment-time {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  min-width: 4.2rem;
  height: 4.2rem;
  border-radius: 999px;
  background: #b7d8d7;
  color: #165f61;
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  padding: 0 0.4rem;
}

.appointment-copy {
  min-width: 0;
}

.appointment-patient {
  margin: 0;
  color: #111827;
  font-size: 1.18rem;
  font-weight: 700;
  line-height: 1.15;
}

.appointment-service {
  margin: 0.35rem 0 0;
  color: #6f9a9d;
  font-size: 1rem;
  line-height: 1.35;
}

.appointment-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.55rem;
}

.appointment-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.3rem 0.75rem;
  border-radius: 999px;
  background: #e4f3ee;
  color: #21695f;
  font-size: 0.85rem;
  font-weight: 700;
  white-space: nowrap;
}

.appointment-chip-urgent {
  background: #fef3e2;
  color: #b45309;
}

.appointment-row-side {
  flex: 0 0 auto;
  gap: 0.65rem;
}

.appointment-chevron {
  color: #80a9a9;
  font-size: 1.35rem;
}

@media (max-width: 640px) {
  .appointment-row {
    padding: 1.1rem 1rem;
  }

  .appointment-time {
    min-width: 3.8rem;
    height: 3.8rem;
    font-size: 0.9rem;
  }

  .appointment-patient {
    font-size: 1rem;
  }

  .appointment-service {
    font-size: 0.95rem;
  }
}
</style>
