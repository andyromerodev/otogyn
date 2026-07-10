<script setup lang="ts">
import { useAppointmentStatsViewModel } from '~/composables/statistics/use-appointment-stats-view-model'
import type { AppointmentStatsRange } from '~~/src/application/dto/appointment-stats'

definePageMeta({
  middleware: 'auth',
})

const viewModel = useAppointmentStatsViewModel()

const rangeOptions: { label: string; value: AppointmentStatsRange }[] = [
  { label: 'Última semana', value: 'week' },
  { label: 'Último mes', value: 'month' },
  { label: 'Último año', value: 'year' },
]

const kpis = computed(() => {
  const s = viewModel.stats.value
  if (!s) return []
  return [
    { label: 'Total de citas', value: s.total, color: 'teal' },
    { label: 'Completadas', value: s.completed, color: 'emerald' },
    { label: 'Canceladas', value: s.cancelled, color: 'rose' },
    { label: 'No asistió', value: s.no_show, color: 'amber' },
    { label: 'Tasa cancelación', value: `${s.cancellationRate}%`, color: 'slate' },
    { label: 'Urgentes', value: s.urgent, color: 'orange' },
    {
      label: 'Duración media',
      value: s.avgDurationMinutes != null ? `${s.avgDurationMinutes} min` : '—',
      color: 'slate',
    },
  ]
})

const kpiColors: Record<string, string> = {
  teal: 'bg-teal-50 text-teal-700 border-teal-100',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  rose: 'bg-rose-50 text-rose-700 border-rose-100',
  amber: 'bg-amber-50 text-amber-700 border-amber-100',
  orange: 'bg-orange-50 text-orange-700 border-orange-100',
  slate: 'bg-slate-50 text-slate-700 border-slate-200',
}
</script>

<template>
  <div class="space-y-6">
    <SharedSectionHeader
      eyebrow="Estadísticas"
      title="Análisis de citas"
      description="Indicadores de rendimiento y tendencias de las citas de la organización."
    />

    <!-- Range selector -->
    <div class="flex flex-wrap gap-2">
      <button
        v-for="opt in rangeOptions"
        :key="opt.value"
        type="button"
        class="rounded-full border px-4 py-2 text-sm font-semibold transition"
        :class="viewModel.range.value === opt.value
          ? 'border-teal-500 bg-teal-600 text-white'
          : 'border-slate-200 bg-white text-slate-600 hover:border-teal-300 hover:bg-teal-50'"
        :disabled="viewModel.loading.value"
        @click="viewModel.setRange(opt.value)"
      >
        {{ opt.label }}
      </button>
    </div>

    <p v-if="viewModel.errorMessage.value" class="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
      {{ viewModel.errorMessage.value }}
    </p>

    <LayoutAppShellLoading v-if="viewModel.loading.value" variant="dashboard" />

    <template v-else-if="viewModel.stats.value">
      <!-- KPI cards -->
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
        <article
          v-for="kpi in kpis"
          :key="kpi.label"
          class="rounded-[24px] border p-4"
          :class="kpiColors[kpi.color]"
        >
          <p class="text-xs font-semibold uppercase tracking-wide opacity-70">{{ kpi.label }}</p>
          <p class="mt-1 text-2xl font-bold tabular-nums">{{ kpi.value }}</p>
        </article>
      </div>

      <!-- Charts (client-only to avoid SSR) -->
      <StatisticsAppointmentStatsCharts :stats="viewModel.stats.value" />
    </template>
  </div>
</template>
