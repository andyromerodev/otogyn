<script setup lang="ts">
import SharedAvatarInitials from '../shared/avatar-initials.vue'
import type { CalendarAppointmentItem } from '~~/src/application/dto/calendar'

const props = defineProps<{
  appointment: CalendarAppointmentItem
  formattedTime: string
}>()

const statusClass = computed(() => {
  switch (props.appointment.status) {
    case 'completed':
      return 'appointment-status-completed'
    case 'in_progress':
      return 'appointment-status-progress'
    case 'checked_in':
      return 'appointment-status-checked-in'
    case 'cancelled':
      return 'appointment-status-cancelled'
    case 'no_show':
      return 'appointment-status-no-show'
    default:
      return 'appointment-status-default'
  }
})

const accentClass = computed(() => {
  switch (props.appointment.status) {
    case 'completed':
      return 'appointment-accent-completed'
    case 'in_progress':
      return 'appointment-accent-progress'
    case 'checked_in':
      return 'appointment-accent-checked-in'
    case 'cancelled':
      return 'appointment-accent-cancelled'
    case 'no_show':
      return 'appointment-accent-no-show'
    default:
      return 'appointment-accent-default'
  }
})
</script>

<template>
  <article class="appointment-card">
    <div class="appointment-time">
      <p class="appointment-time-value">{{ formattedTime }}</p>
      <p class="appointment-duration">{{ appointment.durationMinutes }} min</p>
    </div>

    <div class="appointment-divider" :class="accentClass" />

    <SharedAvatarInitials :name="appointment.patientName" />

    <div class="appointment-copy">
      <div class="appointment-title-row">
        <p class="appointment-patient">{{ appointment.patientName }}</p>
        <span v-if="appointment.isUrgent" class="appointment-urgent">Urgente</span>
      </div>

      <p class="appointment-service">{{ appointment.serviceName }}</p>
    </div>

    <span class="appointment-status" :class="statusClass">
      {{ appointment.statusLabel }}
    </span>
  </article>
</template>

<style scoped>
.appointment-card {
  display: grid;
  grid-template-columns: auto 0.28rem auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 1rem;
  padding: 1.1rem 1rem;
  border-radius: 1.6rem;
  border: 1px solid #c8e1df;
  background: rgba(255, 255, 255, 0.98);
}

.appointment-time-value,
.appointment-duration,
.appointment-patient,
.appointment-service {
  margin: 0;
}

.appointment-time {
  min-width: 4.8rem;
}

.appointment-time-value {
  color: #122d2f;
  font-size: 1rem;
  font-weight: 800;
}

.appointment-duration {
  margin-top: 0.15rem;
  color: #91adb0;
  font-size: 0.9rem;
}

.appointment-divider {
  height: 3.8rem;
  border-radius: 999px;
  background: #b8d7d7;
}

.appointment-accent-default {
  background: #2d7979;
}

.appointment-accent-progress {
  background: #2d7979;
}

.appointment-accent-completed {
  background: #b8d7d7;
}

.appointment-accent-checked-in {
  background: #5b7ed6;
}

.appointment-accent-cancelled {
  background: #cc4b63;
}

.appointment-accent-no-show {
  background: #d08235;
}

.appointment-copy {
  min-width: 0;
}

.appointment-title-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.appointment-patient {
  color: #111827;
  font-size: 1rem;
  font-weight: 800;
}

.appointment-service {
  margin-top: 0.22rem;
  color: #7d9ea1;
  font-size: 0.98rem;
}

.appointment-status,
.appointment-urgent {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 0.38rem 0.8rem;
  font-size: 0.9rem;
  font-weight: 700;
  white-space: nowrap;
}

.appointment-status-default {
  background: #e1f1ee;
  color: #2d7979;
}

.appointment-status-progress {
  background: #dff1ef;
  color: #2d7979;
}

.appointment-status-completed {
  background: #eef5f5;
  color: #7f9ea2;
}

.appointment-status-checked-in {
  background: #edf0fb;
  color: #5b7ed6;
}

.appointment-status-cancelled {
  background: #fdecef;
  color: #c2415a;
}

.appointment-status-no-show {
  background: #fdf1e5;
  color: #bc6a1d;
}

.appointment-urgent {
  background: #fdecef;
  color: #b64058;
}

@media (max-width: 640px) {
  .appointment-card {
    grid-template-columns: auto 0.26rem auto minmax(0, 1fr);
    gap: 0.8rem;
  }

  .appointment-status {
    grid-column: 4;
    justify-self: end;
  }
}
</style>
