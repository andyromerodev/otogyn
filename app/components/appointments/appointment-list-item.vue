<script setup lang="ts">
import { computed } from 'vue'
import type { TodayAppointmentViewModel } from '~~/src/presentation/view-models/dashboard'

const props = defineProps<{
  appointment: TodayAppointmentViewModel
}>()

const timeRange = computed(() => {
  const [start, end] = props.appointment.timeLabel.split(' - ')
  return { start, end: end ?? start }
})
</script>

<template>
  <NuxtLink :to="`/appointments/${appointment.id}`" class="appointment-row-link">
    <article class="appointment-row">
      <div class="appointment-row-content">
        <div class="appointment-row-main">
          <div class="appointment-time">
            <span class="appointment-time-start">{{ timeRange.start }}</span>
            <span class="appointment-time-line" aria-hidden="true" />
            <span class="appointment-time-end">{{ timeRange.end }}</span>
          </div>

          <div class="appointment-copy">
            <p class="appointment-patient">{{ appointment.patientName }}</p>
            <p class="appointment-service">{{ appointment.serviceName }}</p>
          </div>
        </div>

        <div class="appointment-row-side">
          <UIcon name="i-heroicons-chevron-right-20-solid" class="appointment-chevron" />
        </div>
      </div>

      <div class="appointment-chips">
        <span class="appointment-chip">{{ appointment.statusLabel }}</span>
        <span v-if="appointment.isUrgent" class="appointment-chip appointment-chip-urgent">Urgente</span>
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
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 24px;
  box-shadow: var(--shadow-soft);
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    transform 160ms ease;
}

.appointment-row-link:hover .appointment-row {
  border-color: rgba(15, 118, 110, 0.28);
  box-shadow: 0 24px 55px rgba(15, 118, 110, 0.12);
  transform: translateY(-1px);
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
  display: grid;
  grid-template-columns: auto 1fr;
  column-gap: 0.5rem;
  flex: 0 0 auto;
  align-items: center;
  min-width: 6.4rem;
  border-radius: 1rem;
  background: #b7d8d7;
  color: #165f61;
  font-size: 0.85rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  padding: 0.65rem 0.75rem;
}

.appointment-time-start,
.appointment-time-end {
  grid-column: 2;
  line-height: 1.3;
}

.appointment-time-start {
  grid-row: 1;
}

.appointment-time-end {
  grid-row: 2;
}

.appointment-time-line {
  grid-column: 1;
  grid-row: 1 / span 2;
  justify-self: center;
  width: 2px;
  height: 100%;
  min-height: 1.6rem;
  border-radius: 999px;
  background: #165f61;
  opacity: 0.45;
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
    min-width: 5.6rem;
    border-radius: 0.85rem;
    font-size: 0.78rem;
    padding: 0.55rem 0.6rem;
  }

  .appointment-patient {
    font-size: 1rem;
  }

  .appointment-service {
    font-size: 0.95rem;
  }
}
</style>
