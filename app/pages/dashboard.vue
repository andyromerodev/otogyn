<script setup lang="ts">
import type { AppSessionContext } from '~/utils/auth/session-context'
import { useDashboardScreen } from '../composables/dashboard/use-dashboard-screen'

definePageMeta({
  middleware: 'auth',
})

const config = useRuntimeConfig()
const isAuthEnabled = computed(() => config.public.authEnabled)

const { data: sessionContext } = isAuthEnabled.value
  ? await useFetch<AppSessionContext | null>('/api/auth/session-context', {
      headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined,
    })
  : { data: ref<AppSessionContext | null>(null) }

const screen = await useDashboardScreen()

const greeting = computed(() => {
  const hour = new Date().getHours()

  if (hour < 12) {
    return 'Buenos días'
  }

  if (hour < 19) {
    return 'Buenas tardes'
  }

  return 'Buenas noches'
})

const todayLabel = computed(() =>
  new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' }),
)
</script>

<template>
  <div class="page-grid">
    <header class="dashboard-header">
      <div>
        <p class="dashboard-greeting">{{ greeting }} 👋</p>
        <p class="muted-text dashboard-date">
          {{ sessionContext?.name ?? 'OtoGyn' }} · {{ todayLabel }}
        </p>
      </div>

      <div class="dashboard-header-actions">
        <button type="button" class="dashboard-bell" aria-label="Notificaciones">
          <UIcon name="i-heroicons-bell" />
          <span v-if="screen.summary.value && screen.summary.value.urgentToday > 0" class="dashboard-bell-dot" />
        </button>
        <SharedAvatarInitials :name="sessionContext?.name ?? 'OtoGyn'" />
      </div>
    </header>

    <div v-if="screen.loading.value" class="surface-card placeholder-panel">
      Cargando resumen operativo...
    </div>

    <template v-else>
      <section class="dashboard-metrics">
        <DashboardMetricCard
          v-for="metric in screen.metrics.value"
          :key="metric.label"
          :label="metric.label"
          :value="metric.value"
          :note="metric.note"
          :icon="metric.icon"
          :tone="metric.tone"
        />
      </section>

      <DashboardActiveConsultationCard
        v-if="screen.activeConsultation.value"
        :consultation="screen.activeConsultation.value"
      />

      <div class="dashboard-panels">
        <DashboardTodayAppointmentsList
          :appointments="screen.appointments.value"
        />

        <aside v-if="screen.errorMessage.value" class="surface-card insight-card">
          <p class="muted-text">
            {{ screen.errorMessage.value }}
          </p>
        </aside>
      </div>
    </template>
  </div>
</template>

<style scoped>
.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.dashboard-greeting {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 700;
}

.dashboard-date {
  margin: 0.25rem 0 0;
  text-transform: capitalize;
}

.dashboard-header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.dashboard-bell {
  position: relative;
  display: inline-flex;
  height: 2.75rem;
  width: 2.75rem;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  background: rgba(20, 184, 166, 0.12);
  color: var(--teal-strong);
  font-size: 1.25rem;
  cursor: pointer;
}

.dashboard-bell-dot {
  position: absolute;
  top: 0.5rem;
  right: 0.55rem;
  height: 0.55rem;
  width: 0.55rem;
  border-radius: 50%;
  background: #be123c;
}

.dashboard-metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
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

@media (min-width: 1024px) {
  .dashboard-metrics {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 960px) {
  .dashboard-panels {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 560px) {
  .dashboard-header {
    flex-wrap: wrap;
  }

  .dashboard-metrics {
    gap: 0.75rem;
  }

  .dashboard-panels {
    gap: 0.75rem;
  }
}
</style>
