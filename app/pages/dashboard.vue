<script setup lang="ts">
import type {
  DashboardSummaryViewModel,
  TodayAppointmentViewModel,
} from '../../src/presentation/view-models/dashboard'

definePageMeta({
  middleware: 'auth',
})

const { data: summary, status: summaryStatus } = await useFetch<DashboardSummaryViewModel>('/api/dashboard/summary')
const { data: appointments, status: appointmentsStatus } =
  await useFetch<TodayAppointmentViewModel[]>('/api/appointments/today')

const metrics = computed(() => {
  if (!summary.value) {
    return []
  }

  return [
    {
      label: 'Pacientes hoy',
      value: summary.value.totalToday,
      note: 'Citas del dia en la agenda principal.',
    },
    {
      label: 'Completadas',
      value: summary.value.completedToday,
      note: 'Consultas ya cerradas hoy.',
    },
    {
      label: 'Pendientes',
      value: summary.value.pendingToday,
      note: 'Aun requieren atencion o seguimiento.',
    },
    {
      label: 'Urgentes',
      value: summary.value.urgentToday,
      note: 'Casos marcados para priorizacion.',
    },
  ]
})
</script>

<template>
  <div class="page-grid">
    <SharedSectionHeader
      eyebrow="MVP administrativo"
      title="Dashboard de la consulta"
      description="Base conectada a casos de uso limpios, repositorios mock y endpoints listos para migrar a Neon."
    />

    <div v-if="summaryStatus === 'pending'" class="surface-card placeholder-panel">
      Cargando resumen operativo...
    </div>

    <section v-else class="dashboard-metrics">
      <DashboardMetricCard
        v-for="metric in metrics"
        :key="metric.label"
        :label="metric.label"
        :value="metric.value"
        :note="metric.note"
      />
    </section>

    <div class="dashboard-panels">
      <DashboardTodayAppointmentsList
        v-if="appointments"
        :appointments="appointments"
      />

      <aside class="surface-card insight-card">
        <p class="insight-title">Estado base del MVP</p>
        <ul class="insight-list">
          <li>Arquitectura limpia separada por capas.</li>
          <li>Repositorios mock listos para cambiar a Drizzle.</li>
          <li>Reglas criticas de citas cubiertas por Vitest.</li>
          <li>Documentacion, issues y subagentes ya definidos.</li>
        </ul>
        <p v-if="appointmentsStatus === 'pending'" class="muted-text">
          Cargando agenda del dia...
        </p>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.dashboard-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
}

.dashboard-panels {
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(280px, 1fr);
  gap: 1rem;
}

.insight-card {
  padding: 1.5rem;
}

.insight-title {
  margin: 0 0 1rem;
  font-size: 1.1rem;
  font-weight: 700;
}

.insight-list {
  margin: 0;
  padding-left: 1.2rem;
  color: var(--text-soft);
  display: grid;
  gap: 0.55rem;
}

@media (max-width: 960px) {
  .dashboard-metrics,
  .dashboard-panels {
    grid-template-columns: 1fr;
  }
}
</style>
