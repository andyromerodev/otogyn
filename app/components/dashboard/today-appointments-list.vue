<script setup lang="ts">
import type { TodayAppointmentViewModel } from '~~/src/presentation/view-models/dashboard'

defineProps<{
  appointments: TodayAppointmentViewModel[]
}>()

const statusTone: Record<TodayAppointmentViewModel['status'], 'primary' | 'warning' | 'success' | 'error' | 'neutral'> = {
  scheduled: 'primary',
  confirmed: 'primary',
  checked_in: 'warning',
  in_progress: 'warning',
  completed: 'success',
  cancelled: 'neutral',
  no_show: 'error',
}
</script>

<template>
  <div class="surface-card schedule-card">
    <div class="schedule-header">
      <div>
        <p class="schedule-title">Agenda de hoy</p>
        <p class="muted-text">Datos servidos por Nuxt Server API desde PostgreSQL.</p>
      </div>
      <span class="pill">{{ appointments.length }} citas</span>
    </div>

    <div class="schedule-list">
      <article v-for="appointment in appointments" :key="appointment.id" class="schedule-item">
        <div>
          <p class="schedule-time">{{ appointment.timeLabel }}</p>
          <p class="schedule-patient">{{ appointment.patientName }}</p>
          <p class="muted-text schedule-service">{{ appointment.serviceName }}</p>
        </div>

        <div class="schedule-meta">
          <UBadge :color="statusTone[appointment.status]" variant="soft">
            {{ appointment.statusLabel }}
          </UBadge>
          <span v-if="appointment.isUrgent" class="pill">Urgente</span>
        </div>
      </article>
    </div>
  </div>
</template>

<style scoped>
.schedule-card {
  padding: 1.5rem;
}

.schedule-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.schedule-title,
.schedule-time,
.schedule-patient {
  margin: 0;
}

.schedule-list {
  display: grid;
  gap: 0.85rem;
}

.schedule-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  border-radius: 1.1rem;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(15, 118, 110, 0.08);
}

.schedule-time {
  font-weight: 700;
}

.schedule-patient {
  margin-top: 0.25rem;
  font-size: 1.05rem;
}

.schedule-service {
  margin-top: 0.15rem;
}

.schedule-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

@media (max-width: 640px) {
  .schedule-item {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
