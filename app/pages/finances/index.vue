<script setup lang="ts">
import DashboardMetricCard from '../../components/dashboard/dashboard-metric-card.vue'
import FinanceMonthlyCharts from '../../components/finances/finance-monthly-charts.client.vue'
import { useFinanceSummaryViewModel } from '../../composables/finances/use-finance-summary-view-model'

definePageMeta({
  middleware: 'auth',
})

const viewModel = useFinanceSummaryViewModel()
</script>

<template>
  <div class="finances-dashboard">
    <header class="surface-card finances-hero">
      <div class="finances-hero-copy">
        <p class="finances-eyebrow">Dashboard mensual</p>
        <h1 class="finances-title">Finanzas</h1>
        <p class="finances-subtitle">
          {{ viewModel.summary.value?.monthLabel ?? 'Control de ingresos y gastos de la clínica' }}
        </p>
      </div>

      <div class="finances-hero-actions">
        <NuxtLink to="/finances/payments" class="finances-hero-link finances-hero-link-green">
          <UIcon name="i-heroicons-banknotes-20-solid" />
          <span>Pagos</span>
        </NuxtLink>
        <NuxtLink to="/finances/expenses" class="finances-hero-link finances-hero-link-rose">
          <UIcon name="i-heroicons-receipt-percent-20-solid" />
          <span>Gastos</span>
        </NuxtLink>
      </div>
    </header>

    <p v-if="viewModel.errorMessage.value" class="finances-message finances-message-error">
      {{ viewModel.errorMessage.value }}
    </p>

    <LayoutAppShellLoading v-if="viewModel.loading.value" variant="dashboard" />

    <template v-else-if="viewModel.summary.value">
      <section class="surface-card finances-overview">
        <div>
          <p class="finances-overview-eyebrow">{{ viewModel.overviewTitle.value }}</p>
          <h2 class="finances-overview-title">{{ viewModel.summary.value.monthLabel }}</h2>
        </div>
        <p class="finances-overview-copy">{{ viewModel.overviewBody.value }}</p>
      </section>

      <section class="finances-metrics">
        <DashboardMetricCard
          v-for="metric in viewModel.metrics.value"
          :key="metric.label"
          :label="metric.label"
          :value="metric.value"
          :note="metric.note"
          :icon="metric.icon"
          :tone="metric.tone"
        />
      </section>

      <div class="finances-content">
        <FinanceMonthlyCharts
          v-if="viewModel.hasChartData.value"
          :series="viewModel.summary.value.series"
        />

        <article v-else class="surface-card finances-empty-state">
          <h3 class="finances-empty-title">Todavía no hay suficiente movimiento para graficar</h3>
          <p class="finances-empty-copy">
            Cuando se registren pagos o gastos, aquí aparecerá la tendencia de los últimos 12 meses.
          </p>
        </article>
      </div>
    </template>
  </div>
</template>

<style scoped>
.finances-dashboard {
  display: grid;
  gap: 1.5rem;
  max-width: 78rem;
}

.finances-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 1.5rem;
  border: 1px solid rgba(140, 197, 190, 0.65);
  background:
    radial-gradient(circle at top left, rgba(167, 243, 208, 0.6), transparent 36%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(239, 250, 248, 0.98));
}

.finances-hero-copy {
  display: grid;
  gap: 0.35rem;
}

.finances-eyebrow {
  margin: 0;
  color: #0f766e;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.finances-title {
  margin: 0;
  color: #132b2d;
  font-size: clamp(2.1rem, 4vw, 3.2rem);
  font-weight: 800;
  letter-spacing: -0.05em;
}

.finances-subtitle {
  margin: 0;
  color: #7ca0a2;
  font-size: 1.15rem;
}

.finances-hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.finances-hero-link {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  border-radius: 999px;
  padding: 0.85rem 1.15rem;
  color: inherit;
  font-weight: 700;
  transition: transform 160ms ease, box-shadow 160ms ease;
}

.finances-hero-link:hover {
  transform: translateY(-1px);
}

.finances-hero-link-green {
  background: rgba(209, 250, 229, 0.8);
  color: #065f46;
}

.finances-hero-link-rose {
  background: rgba(255, 228, 230, 0.9);
  color: #9f1239;
}

.finances-message {
  margin: 0;
  border-radius: 1.1rem;
  padding: 0.95rem 1rem;
  font-weight: 600;
}

.finances-message-error {
  background: #fff1f2;
  color: #b91c1c;
}

.finances-overview {
  display: grid;
  gap: 0.5rem;
  padding: 1.35rem 1.5rem;
}

.finances-overview-eyebrow {
  margin: 0 0 0.2rem;
  color: #0f766e;
  font-size: 0.85rem;
  font-weight: 700;
}

.finances-overview-title {
  margin: 0;
  color: #132b2d;
  font-size: clamp(1.35rem, 3vw, 1.8rem);
  font-weight: 800;
}

.finances-overview-copy {
  margin: 0;
  color: #6f9a9d;
  font-size: 0.98rem;
}

.finances-metrics {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.finances-content {
  display: grid;
  gap: 1rem;
}

.finances-empty-state {
  display: grid;
  gap: 0.45rem;
  padding: 1.5rem;
}

.finances-empty-title {
  margin: 0;
  color: #132b2d;
  font-size: 1.05rem;
  font-weight: 800;
}

.finances-empty-copy {
  margin: 0;
  color: #6f9a9d;
}

@media (min-width: 1024px) {
  .finances-metrics {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .finances-hero {
    align-items: start;
    flex-direction: column;
  }
}

@media (max-width: 640px) {
  .finances-dashboard {
    gap: 1rem;
  }

  .finances-hero,
  .finances-overview {
    padding: 1.2rem;
  }

  .finances-metrics {
    grid-template-columns: 1fr;
  }
}
</style>
