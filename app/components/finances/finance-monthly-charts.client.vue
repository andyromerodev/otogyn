<script setup lang="ts">
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  type ChartOptions,
  Filler,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  type TooltipItem,
} from 'chart.js'
import { computed } from 'vue'
import { Bar, Line } from 'vue-chartjs'
import type { FinanceSummaryMonthDto } from '~~/src/application/dto/finance-summary'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  BarElement,
  BarController,
  Filler,
)

const props = defineProps<{
  series: FinanceSummaryMonthDto[]
}>()

const currencyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 0,
})

const lineData = computed(() => ({
  labels: props.series.map((item) => item.monthShortLabel),
  datasets: [
    {
      label: 'Ingresos',
      data: props.series.map((item) => item.income),
      borderColor: '#0f766e',
      backgroundColor: 'rgba(15, 118, 110, 0.16)',
      fill: true,
      tension: 0.3,
    },
    {
      label: 'Gastos',
      data: props.series.map((item) => item.expenses),
      borderColor: '#be123c',
      backgroundColor: 'rgba(190, 18, 60, 0.12)',
      fill: true,
      tension: 0.3,
    },
  ],
}))

const balanceData = computed(() => ({
  labels: props.series.map((item) => item.monthShortLabel),
  datasets: [
    {
      label: 'Balance',
      data: props.series.map((item) => item.balance),
      backgroundColor: props.series.map((item) =>
        item.balance >= 0 ? 'rgba(22, 163, 74, 0.72)' : 'rgba(225, 29, 72, 0.72)',
      ),
      borderRadius: 10,
      maxBarThickness: 32,
    },
  ],
}))

const lineOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index' as const,
    intersect: false,
  },
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        usePointStyle: true,
      },
    },
    tooltip: {
      callbacks: {
        label: (context: TooltipItem<'line'>) =>
          `${context.dataset.label ?? 'Monto'}: ${currencyFormatter.format(Number(context.parsed.y ?? 0))}`,
      },
    },
  },
  scales: {
    y: {
      ticks: {
        callback: (value: string | number) => currencyFormatter.format(Number(value)),
      },
    },
  },
}

const balanceOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: (context: TooltipItem<'bar'>) =>
          `Balance: ${currencyFormatter.format(Number(context.parsed.y ?? 0))}`,
      },
    },
  },
  scales: {
    y: {
      ticks: {
        callback: (value: string | number) => currencyFormatter.format(Number(value)),
      },
    },
  },
}
</script>

<template>
  <div class="finance-charts">
    <article class="surface-card finance-chart-card">
      <div class="finance-chart-copy">
        <p class="finance-chart-eyebrow">Tendencia</p>
        <h3 class="finance-chart-title">Ingresos vs gastos</h3>
        <p class="finance-chart-text">Serie de 12 meses para detectar cambios de ritmo y estacionalidad.</p>
      </div>

      <div class="finance-chart-canvas">
        <Line :data="lineData" :options="lineOptions" />
      </div>
    </article>

    <article class="surface-card finance-chart-card">
      <div class="finance-chart-copy">
        <p class="finance-chart-eyebrow">Resultado</p>
        <h3 class="finance-chart-title">Balance mensual</h3>
        <p class="finance-chart-text">Verde indica superávit; rojo indica un mes con más gastos que ingresos.</p>
      </div>

      <div class="finance-chart-canvas">
        <Bar :data="balanceData" :options="balanceOptions" />
      </div>
    </article>
  </div>
</template>

<style scoped>
.finance-charts {
  display: grid;
  gap: 1rem;
}

.finance-chart-card {
  display: grid;
  gap: 1rem;
  padding: 1.25rem;
}

.finance-chart-copy {
  display: grid;
  gap: 0.35rem;
}

.finance-chart-eyebrow {
  margin: 0;
  color: #0f766e;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.finance-chart-title {
  margin: 0;
  color: #132b2d;
  font-size: 1.1rem;
  font-weight: 800;
}

.finance-chart-text {
  margin: 0;
  color: #6f9a9d;
  font-size: 0.92rem;
}

.finance-chart-canvas {
  min-height: 280px;
}

@media (min-width: 1120px) {
  .finance-charts {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
