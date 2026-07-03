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
      </div>
      <NuxtLink to="/calendar" class="schedule-see-all">Ver todo</NuxtLink>
    </div>

    <div v-if="appointments.length" class="schedule-list">
      <article v-for="appointment in appointments" :key="appointment.id" class="schedule-item">
        <SharedAvatarInitials :name="appointment.patientName" size="sm" />

        <div class="schedule-item-body">
          <p class="schedule-patient">{{ appointment.patientName }}</p>
          <p class="muted-text schedule-service">{{ appointment.serviceName }} · {{ appointment.timeLabel }}</p>
        </div>

        <div class="schedule-meta">
          <span v-if="appointment.isUrgent" class="pill">Urgente</span>
          <NuxtLink
            v-if="appointment.status === 'checked_in' || appointment.status === 'in_progress'"
            :to="`/consultations/${appointment.id}`"
            class="schedule-attend-button"
          >
            Atender
          </NuxtLink>
          <UIcon
            v-else-if="appointment.status === 'completed'"
            name="i-heroicons-check-circle-solid"
            class="schedule-status-icon"
          />
          <UBadge v-else :color="statusTone[appointment.status]" variant="soft">
            {{ appointment.statusLabel }}
          </UBadge>
        </div>
      </article>
    </div>

    <div v-else class="schedule-empty-state">
      No hay citas registradas para hoy.
    </div>
  </div>
</template>

<style scoped>
.schedule-card {
  padding: 1.5rem;
}

.schedule-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.schedule-title,
.schedule-patient {
  margin: 0;
}

.schedule-list {
  display: grid;
  gap: 0.85rem;
}

.schedule-empty-state {
  border-radius: 1.1rem;
  background: rgba(248, 252, 251, 0.96);
  border: 1px solid rgba(15, 118, 110, 0.08);
  padding: 1rem;
  color: var(--text-soft);
}

.schedule-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 1.1rem;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(15, 118, 110, 0.08);
}

.schedule-item-body {
  min-width: 0;
  flex: 1;
}

.schedule-patient {
  font-size: 1.05rem;
}

.schedule-service {
  margin-top: 0.15rem;
}

.schedule-meta {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 0.5rem;
}

.schedule-status-icon {
  font-size: 1.4rem;
  color: #15803d;
}

.schedule-attend-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.45rem 0.9rem;
  border-radius: 999px;
  background: #0f766e;
  color: white;
  font-size: 0.85rem;
  font-weight: 700;
  white-space: nowrap;
}

.schedule-see-all {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--teal-strong);
}

@media (max-width: 640px) {
  .schedule-card {
    padding: 1.1rem;
  }

  .schedule-meta {
    flex-wrap: wrap;
    justify-content: flex-end;
  }
}
</style>
