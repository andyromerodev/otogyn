<script setup lang="ts">
import { useDashboardScreen } from '../composables/dashboard/use-dashboard-screen'

definePageMeta({
  middleware: 'auth',
})

const screen = await useDashboardScreen()
</script>

<template>
  <div class="page-grid">
    <SharedSectionHeader
      eyebrow="MVP administrativo"
      title="Dashboard de la consulta"
      description="Base conectada a casos de uso limpios, repositorios mock y endpoints listos para migrar a Neon."
    />

    <div v-if="screen.loading.value" class="surface-card placeholder-panel">
      Cargando resumen operativo...
    </div>

    <section v-else class="dashboard-metrics">
      <DashboardMetricCard
        v-for="metric in screen.metrics.value"
        :key="metric.label"
        :label="metric.label"
        :value="metric.value"
        :note="metric.note"
      />
    </section>

    <div class="dashboard-panels">
      <DashboardTodayAppointmentsList
        :appointments="screen.appointments.value"
      />

      <aside class="surface-card insight-card">
        <p class="insight-title">Estado base del MVP</p>
        <ul class="insight-list">
          <li>Arquitectura limpia separada por capas.</li>
          <li>Features administrativas ya siguen flujo Android-like en frontend.</li>
          <li>Reglas criticas de citas cubiertas por Vitest.</li>
          <li>Documentacion, issues y subagentes ya definidos.</li>
        </ul>
        <p v-if="screen.errorMessage.value" class="muted-text">
          {{ screen.errorMessage.value }}
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
