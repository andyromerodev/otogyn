<script setup lang="ts">
import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  type ChartOptions,
  DoughnutController,
  Legend,
  LinearScale,
  Title,
  Tooltip,
  type TooltipItem,
} from 'chart.js'
import { computed } from 'vue'
import { Bar, Doughnut } from 'vue-chartjs'
import type { AppointmentStatsDto } from '~~/src/application/dto/appointment-stats'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  ArcElement,
  DoughnutController,
)

const props = defineProps<{ stats: AppointmentStatsDto }>()

const monthlyData = computed(() => ({
  labels: props.stats.monthlySeries.map((m) => m.monthShortLabel),
  datasets: [
    {
      label: 'Completadas',
      data: props.stats.monthlySeries.map((m) => m.completed),
      backgroundColor: 'rgba(15, 118, 110, 0.80)',
      borderRadius: 6,
      maxBarThickness: 28,
    },
    {
      label: 'Canceladas',
      data: props.stats.monthlySeries.map((m) => m.cancelled),
      backgroundColor: 'rgba(190, 18, 60, 0.72)',
      borderRadius: 6,
      maxBarThickness: 28,
    },
    {
      label: 'No asistió',
      data: props.stats.monthlySeries.map((m) => m.no_show),
      backgroundColor: 'rgba(161, 98, 7, 0.72)',
      borderRadius: 6,
      maxBarThickness: 28,
    },
  ],
}))

const stackedOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: { usePointStyle: true, boxWidth: 10, padding: 16, font: { size: 12 } },
    },
    tooltip: {
      callbacks: {
        label: (ctx: TooltipItem<'bar'>) => `${ctx.dataset.label}: ${ctx.parsed.y}`,
      },
    },
  },
  scales: {
    x: {
      stacked: true,
      grid: { display: false },
      border: { display: false },
      ticks: { maxRotation: 45, minRotation: 45, autoSkip: true, maxTicksLimit: 12, font: { size: 11 } },
    },
    y: {
      stacked: true,
      beginAtZero: true,
      grace: '8%',
      grid: { drawTicks: false },
      border: { display: false },
      ticks: { maxTicksLimit: 6, font: { size: 11 } },
    },
  },
}

const serviceData = computed(() => ({
  labels: props.stats.byService.map((s) => s.serviceName),
  datasets: [
    {
      data: props.stats.byService.map((s) => s.count),
      backgroundColor: [
        'rgba(15, 118, 110, 0.80)',
        'rgba(6, 95, 70, 0.80)',
        'rgba(4, 120, 87, 0.80)',
        'rgba(5, 150, 105, 0.80)',
        'rgba(20, 184, 166, 0.80)',
        'rgba(13, 148, 136, 0.80)',
        'rgba(45, 212, 191, 0.80)',
        'rgba(94, 234, 212, 0.80)',
        'rgba(110, 231, 183, 0.80)',
        'rgba(134, 239, 172, 0.80)',
      ],
      borderWidth: 0,
    },
  ],
}))

const doughnutOptions: ChartOptions<'doughnut'> = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '60%',
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        usePointStyle: true,
        boxWidth: 9,
        padding: 10,
        font: { size: 10 },
        generateLabels: (chart) => {
          const data = chart.data
          return (data.labels as string[]).map((label, i) => ({
            text: label.length > 22 ? label.slice(0, 22) + '…' : label,
            fillStyle: (data.datasets[0]?.backgroundColor as string[])?.[i] ?? '#999',
            hidden: false,
            index: i,
          }))
        },
      },
    },
    tooltip: {
      callbacks: {
        label: (ctx: TooltipItem<'doughnut'>) => ` ${ctx.label}: ${ctx.parsed}`,
      },
    },
  },
}

const weekdayData = computed(() => ({
  labels: props.stats.byWeekday.map((w) => w.label),
  datasets: [
    {
      label: 'Citas',
      data: props.stats.byWeekday.map((w) => w.count),
      backgroundColor: props.stats.byWeekday.map((w) =>
        w.weekday === 0 || w.weekday === 6
          ? 'rgba(161, 98, 7, 0.55)'
          : 'rgba(15, 118, 110, 0.75)',
      ),
      borderRadius: 8,
      maxBarThickness: 40,
      categoryPercentage: 0.72,
      barPercentage: 0.82,
    },
  ],
}))

const weekdayOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx: TooltipItem<'bar'>) => ` ${ctx.parsed.y} citas`,
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      border: { display: false },
      ticks: { font: { size: 12 } },
    },
    y: {
      beginAtZero: true,
      grace: '10%',
      grid: { drawTicks: false },
      border: { display: false },
      ticks: { maxTicksLimit: 5, font: { size: 11 } },
    },
  },
}
</script>

<template>
  <div class="stats-charts">
    <article class="surface-card stats-chart-card">
      <div class="stats-chart-copy">
        <p class="stats-chart-eyebrow">Tendencia 12 meses</p>
        <h3 class="stats-chart-title">Citas por estado</h3>
      </div>
      <div class="stats-chart-canvas">
        <Bar :data="monthlyData" :options="stackedOptions" />
      </div>
    </article>

    <div class="stats-charts-bottom">
      <article class="surface-card stats-chart-card" style="min-height: 0;">
        <div class="stats-chart-copy">
          <p class="stats-chart-eyebrow">Distribución</p>
          <h3 class="stats-chart-title">Por servicio</h3>
        </div>
        <div class="stats-chart-canvas stats-chart-canvas-sm">
          <Doughnut :data="serviceData" :options="doughnutOptions" />
        </div>
      </article>

      <article class="surface-card stats-chart-card">
        <div class="stats-chart-copy">
          <p class="stats-chart-eyebrow">Distribución</p>
          <h3 class="stats-chart-title">Por día de semana</h3>
        </div>
        <div class="stats-chart-canvas stats-chart-canvas-sm">
          <Bar :data="weekdayData" :options="weekdayOptions" />
        </div>
      </article>
    </div>
  </div>
</template>

<style scoped>
.stats-charts {
  display: grid;
  gap: 1rem;
}

.stats-charts-bottom {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr 1fr;
}

.stats-chart-card {
  display: grid;
  gap: 0.875rem;
  padding: 1.25rem;
  overflow: hidden;
  min-width: 0;
}

.stats-chart-copy {
  display: grid;
  gap: 0.2rem;
}

.stats-chart-eyebrow {
  margin: 0;
  color: #0f766e;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.stats-chart-title {
  margin: 0;
  color: #132b2d;
  font-size: 1rem;
  font-weight: 700;
}

.stats-chart-canvas {
  min-width: 0;
  height: 300px;
  overflow: hidden;
}

.stats-chart-canvas-sm {
  height: 280px;
}

/* tablet */
@media (max-width: 900px) {
  .stats-charts-bottom {
    grid-template-columns: 1fr;
  }
  .stats-chart-canvas-sm {
    height: 260px;
  }
}

/* mobile */
@media (max-width: 540px) {
  .stats-chart-card {
    padding: 1rem;
  }
  .stats-chart-canvas {
    height: 240px;
  }
  .stats-chart-canvas-sm {
    height: 220px;
  }
}
</style>
