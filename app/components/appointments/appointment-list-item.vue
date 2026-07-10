<script setup lang="ts">
import { computed } from 'vue'
import {
  resolveAppointmentPaymentBadge,
  type AppointmentListItemViewModel,
} from '~~/src/presentation/view-models/appointments/appointment-list'

const props = defineProps<{
  appointment: AppointmentListItemViewModel
}>()

const router = useRouter()

const timeRange = computed(() => {
  const [start, end] = props.appointment.timeLabel.split(' - ')
  return { start, end: end ?? start }
})

const consultationAction = computed(() => {
  if (props.appointment.status === 'checked_in' || props.appointment.status === 'in_progress') {
    return { label: 'Atender', variant: 'primary' as const }
  }
  if (props.appointment.status === 'completed') {
    return { label: 'Ver atención', variant: 'secondary' as const }
  }
  return null
})

const statusBadge = computed(() => {
  const status = props.appointment.status

  if (status === 'checked_in') {
    return { label: 'En sala', tone: 'warning' as const }
  }

  if (status === 'in_progress') {
    return { label: 'En atención', tone: 'primary' as const }
  }

  if (status === 'completed') {
    return { label: 'Completada', tone: 'neutral' as const }
  }

  if (status === 'confirmed') {
    return { label: 'Confirmada', tone: 'primary' as const }
  }

  if (status === 'cancelled') {
    return { label: 'Cancelada', tone: 'danger' as const }
  }

  if (status === 'no_show') {
    return { label: 'No asistió', tone: 'danger' as const }
  }

  return { label: props.appointment.statusLabel, tone: 'soft' as const }
})

const paymentBadge = computed(() => resolveAppointmentPaymentBadge(props.appointment))

const openAppointmentDetail = () => {
  void router.push(`/appointments/${props.appointment.id}`)
}
</script>

<template>
  <article
    class="appointment-row"
    role="link"
    tabindex="0"
    @click="openAppointmentDetail"
    @keydown.enter.prevent="openAppointmentDetail"
    @keydown.space.prevent="openAppointmentDetail"
  >
    <div class="appointment-mainline">
      <div class="appointment-time">
        <span class="appointment-time-start">{{ timeRange.start }}</span>
        <span class="appointment-time-separator" aria-hidden="true" />
        <span class="appointment-time-end">{{ timeRange.end }}</span>
      </div>

      <div class="appointment-copy">
        <p class="appointment-patient">{{ appointment.patientName }}</p>
        <p class="appointment-service">{{ appointment.serviceName }}</p>
      </div>

      <UIcon name="i-heroicons-chevron-right-20-solid" class="appointment-chevron" />
    </div>

    <div class="appointment-meta">
      <div class="appointment-signals">
        <span class="appointment-status-badge" :class="`appointment-status-badge-${statusBadge.tone}`">
          <span class="appointment-status-dot" aria-hidden="true" />
          {{ statusBadge.label }}
        </span>
        <span class="appointment-payment-badge" :class="`appointment-payment-badge-${paymentBadge.tone}`">
          {{ paymentBadge.label }}
        </span>
        <span v-if="appointment.isUrgent" class="appointment-urgent-mark">
          Urgente
        </span>
      </div>

      <NuxtLink
        v-if="consultationAction"
        :to="`/consultations/${appointment.id}`"
        class="appointment-consultation-action"
        :class="`appointment-consultation-action-${consultationAction.variant}`"
        @click.stop
      >
        {{ consultationAction.label }}
        <UIcon
          :name="consultationAction.variant === 'primary' ? 'i-heroicons-arrow-up-right-20-solid' : 'i-heroicons-document-text-20-solid'"
          class="appointment-action-icon"
        />
      </NuxtLink>
    </div>
  </article>
</template>

<style scoped>
.appointment-row {
  container-type: inline-size;
  display: grid;
  gap: 0.7rem;
  padding: 1rem 1.05rem;
  background: color-mix(in oklab, var(--card-bg) 88%, white);
  border: 1px solid color-mix(in oklab, var(--border-color) 86%, #b7d8d7);
  border-radius: 22px;
  box-shadow: 0 16px 36px rgba(15, 78, 78, 0.08);
  cursor: pointer;
  outline: none;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    transform 160ms ease;
}

.appointment-row:hover,
.appointment-row:focus-visible {
  border-color: rgba(15, 118, 110, 0.24);
  box-shadow: 0 20px 44px rgba(15, 118, 110, 0.12);
  transform: translateY(-1px);
}

.appointment-mainline {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.9rem;
  min-width: 0;
}

.appointment-time {
  display: grid;
  grid-template-columns: auto 1fr;
  column-gap: 0.52rem;
  align-items: center;
  min-width: 7rem;
  padding: 0.7rem 0.8rem;
  border-radius: 1.05rem;
  background: #d7ece8;
  color: #185c60;
  font-size: 0.88rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.1;
}

.appointment-time-start,
.appointment-time-end {
  grid-column: 2;
  white-space: nowrap;
}

.appointment-time-start {
  grid-row: 1;
}

.appointment-time-end {
  grid-row: 2;
}

.appointment-time-separator {
  grid-column: 1;
  grid-row: 1 / span 2;
  width: 2px;
  height: 100%;
  min-height: 2rem;
  border-radius: 999px;
  background: rgba(24, 92, 96, 0.28);
}

.appointment-copy {
  min-width: 0;
}

.appointment-patient,
.appointment-service {
  margin: 0;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.appointment-patient {
  color: #173638;
  font-size: 1.12rem;
  font-weight: 800;
  line-height: 1.15;
}

.appointment-service {
  margin-top: 0.24rem;
  color: #6b8f92;
  font-size: 0.98rem;
  font-weight: 500;
  line-height: 1.2;
  white-space: normal;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: clip;
}

.appointment-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.85rem;
  min-width: 0;
}

.appointment-signals {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.appointment-status-badge,
.appointment-payment-badge,
.appointment-urgent-mark,
.appointment-consultation-action {
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
}

.appointment-status-badge {
  gap: 0.38rem;
  min-height: 2rem;
  padding: 0.36rem 0.78rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
}

.appointment-payment-badge {
  min-height: 2rem;
  padding: 0.36rem 0.78rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
}

.appointment-status-dot {
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 999px;
  background: currentColor;
  opacity: 0.82;
}

.appointment-status-badge-primary {
  background: #e2f1ef;
  color: #0f766e;
}

.appointment-status-badge-warning {
  background: #fef4e5;
  color: #b5671c;
}

.appointment-status-badge-neutral {
  background: #eef4f4;
  color: #62797b;
}

.appointment-status-badge-danger {
  background: #fff0f3;
  color: #b4234d;
}

.appointment-status-badge-soft {
  background: #edf6f5;
  color: #447274;
}

.appointment-payment-badge-success {
  background: #eaf8ee;
  color: #166534;
}

.appointment-payment-badge-pending {
  background: #fff4df;
  color: #b86111;
}

.appointment-urgent-mark {
  min-height: 1.85rem;
  padding: 0.3rem 0.68rem;
  border-radius: 999px;
  background: #fff4df;
  color: #b86111;
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.01em;
}

.appointment-consultation-action {
  gap: 0.34rem;
  min-height: 2.15rem;
  padding: 0.42rem 0.82rem;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 800;
  text-decoration: none;
}

.appointment-consultation-action-primary {
  background: #0f766e;
  color: white;
  box-shadow: 0 10px 20px rgba(15, 118, 110, 0.16);
}

.appointment-consultation-action-secondary {
  border: 1px solid color-mix(in oklab, var(--border-color) 84%, #a9c8c8);
  background: rgba(255, 255, 255, 0.92);
  color: #0f766e;
}

.appointment-action-icon {
  font-size: 0.95rem;
}

.appointment-chevron {
  flex: 0 0 auto;
  color: #a4c0c0;
  font-size: 1.05rem;
}

@container (max-width: 840px) {
  .appointment-meta {
    flex-wrap: wrap;
    gap: 0.65rem;
  }
}

@container (max-width: 560px) {
  .appointment-row {
    padding: 0.9rem;
    gap: 0.75rem;
  }

  .appointment-mainline {
    grid-template-columns: auto minmax(0, 1fr);
    align-items: start;
  }

  .appointment-time {
    min-width: 5.8rem;
    padding: 0.62rem 0.68rem;
    border-radius: 0.92rem;
    font-size: 0.78rem;
  }

  .appointment-patient {
    font-size: 1rem;
  }

  .appointment-service {
    margin-top: 0.16rem;
    font-size: 0.92rem;
  }

  .appointment-meta {
    align-items: flex-start;
  }

  .appointment-chevron {
    display: none;
  }
}
</style>
