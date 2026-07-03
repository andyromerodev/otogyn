<script setup lang="ts">
import { computed } from 'vue'
import type { PatientConsultationHistoryItem } from '~~/src/application/dto/consultation'

const props = defineProps<{
  consultations: PatientConsultationHistoryItem[]
  loading?: boolean
  errorMessage?: string | null
}>()

const statusLabel: Record<PatientConsultationHistoryItem['status'], string> = {
  draft: 'Borrador',
  completed: 'Completada',
}

const dateFormatter = new Intl.DateTimeFormat('es-PE', {
  timeZone: 'America/Lima',
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

const items = computed(() =>
  props.consultations.map((item) => ({
    id: item.id,
    appointmentId: item.appointmentId,
    status: item.status,
    statusLabel: statusLabel[item.status],
    dateLabel: dateFormatter.format(new Date(item.completedAt ?? item.createdAt)),
    diagnosesSummary: item.diagnoses.length
      ? item.diagnoses.map((diagnosis) => diagnosis.description).join(', ')
      : 'Sin diagnósticos registrados',
  })),
)
</script>

<template>
  <div class="consultation-history">
    <p v-if="loading" class="consultation-history-state">Cargando historia clínica...</p>
    <p v-else-if="errorMessage" class="consultation-history-state consultation-history-error">{{ errorMessage }}</p>
    <p v-else-if="!items.length" class="consultation-history-state">Sin atenciones registradas</p>

    <div v-else class="consultation-history-list">
      <NuxtLink
        v-for="item in items"
        :key="item.id"
        :to="`/consultations/${item.appointmentId}`"
        class="consultation-history-item"
      >
        <div class="consultation-history-item-main">
          <p class="consultation-history-date">{{ item.dateLabel }}</p>
          <p class="consultation-history-diagnoses">{{ item.diagnosesSummary }}</p>
        </div>

        <span
          class="consultation-history-status"
          :class="{ 'consultation-history-status-completed': item.status === 'completed' }"
        >
          {{ item.statusLabel }}
        </span>
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.consultation-history {
  display: grid;
  gap: 0.75rem;
}

.consultation-history-state {
  margin: 0;
  border-radius: 1.1rem;
  background: rgba(248, 252, 251, 0.96);
  border: 1px solid var(--border-color);
  padding: 1rem;
  color: var(--text-soft);
}

.consultation-history-error {
  background: #fff1f2;
  color: #b91c1c;
  border-color: transparent;
}

.consultation-history-list {
  display: grid;
  gap: 0.65rem;
}

.consultation-history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 1rem;
  padding: 0.9rem 1rem;
  background: rgba(255, 255, 255, 0.88);
  color: inherit;
  transition: border-color 160ms ease, box-shadow 160ms ease;
}

.consultation-history-item:hover {
  border-color: rgba(15, 118, 110, 0.28);
  box-shadow: 0 16px 32px rgba(15, 118, 110, 0.1);
}

.consultation-history-item-main {
  min-width: 0;
}

.consultation-history-date {
  margin: 0;
  font-weight: 700;
  color: var(--text-main);
}

.consultation-history-diagnoses {
  margin: 0.25rem 0 0;
  color: var(--text-soft);
  font-size: 0.92rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.consultation-history-status {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.35rem 0.8rem;
  border-radius: 999px;
  background: #fffbeb;
  color: #92400e;
  font-size: 0.82rem;
  font-weight: 700;
  white-space: nowrap;
}

.consultation-history-status-completed {
  background: #ecfdf5;
  color: #047857;
}
</style>
